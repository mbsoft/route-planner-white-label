import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';

// Check if Turso environment variables are set
const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

let turso: any;

console.log('API TURSO_DATABASE_URL:', process.env.TURSO_DATABASE_URL);
if (tursoUrl && tursoAuthToken && !tursoUrl.includes('your_turso_database_url_here')) {
  // Use Turso if environment variables are properly set
  turso = createClient({ url: tursoUrl, authToken: tursoAuthToken });
} else {
  // Fallback to local SQLite for development
  console.log('Turso environment variables not set, using local SQLite database');
  turso = createClient({ 
    url: 'file:./local.db',
    syncUrl: undefined,
    authToken: undefined
  });
}

async function ensureTable() {
  // Create table if it doesn't exist
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS optimization_results (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL,
      title TEXT NOT NULL,
      response_data TEXT NOT NULL,
      shared_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'completed',
      solution_time REAL
    )
  `);
  
  // Check if title column exists, if not add it
  try {
    await turso.execute('SELECT title FROM optimization_results LIMIT 1');
  } catch (error) {
    // Title column doesn't exist, add it
    await turso.execute('ALTER TABLE optimization_results ADD COLUMN title TEXT DEFAULT "Untitled"');
  }

  // Check if shared_url column exists, if not add it
  try {
    await turso.execute('SELECT shared_url FROM optimization_results LIMIT 1');
  } catch (error) {
    // shared_url column doesn't exist, add it
    await turso.execute('ALTER TABLE optimization_results ADD COLUMN shared_url TEXT');
  }

  // Check if solution_time column exists, if not add it
  try {
    await turso.execute('SELECT solution_time FROM optimization_results LIMIT 1');
  } catch (error) {
    // solution_time column doesn't exist, add it
    await turso.execute('ALTER TABLE optimization_results ADD COLUMN solution_time REAL');
  }
}

async function ensureJobsTable() {
  // Create jobs table if it doesn't exist
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      description TEXT,
      location TEXT,
      latitude REAL,
      longitude REAL,
      service INTEGER,
      delivery TEXT,
      skills TEXT,
      time_window_start TEXT,
      time_window_end TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function ensureVehiclesTable() {
  // Create vehicles table if it doesn't exist (don't drop existing data)
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id TEXT PRIMARY KEY,
      description TEXT,
      start_location TEXT,
      start_latitude REAL,
      start_longitude REAL,
      end_location TEXT,
      end_latitude REAL,
      end_longitude REAL,
      time_window_start TEXT,
      time_window_end TEXT,
      capacity TEXT,
      alternative_capacities TEXT,
      skills TEXT,
      fixed_cost REAL,
      max_tasks INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function populateJobsFromCSV() {
  try {
    const csvPath = path.join(process.cwd(), 'jobs.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n');
    
    // Clear existing data
    await turso.execute('DELETE FROM jobs');
    
    // Insert new data
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        // Parse CSV line properly handling quoted fields
        const values = parseCSVLine(lines[i]);
        
        // Parse skills array properly - handle quoted array strings
        let skills = values[7]?.replace(/"/g, '') || '[]';
        try {
          // If skills is already a valid JSON array, use it as is
          JSON.parse(skills);
        } catch {
          // If not valid JSON, try to parse it as a simple array
          if (skills.startsWith('[') && skills.endsWith(']')) {
            // Remove brackets and split by comma, then parse as integers
            const skillsArray = skills.slice(1, -1).split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
            skills = JSON.stringify(skillsArray);
          } else {
            skills = '[]';
          }
        }
        
        const job = {
          id: values[0]?.replace(/"/g, ''),
          description: values[1]?.replace(/"/g, ''),
          location: '', // Not using location field from CSV
          latitude: parseFloat(values[3] || '0'), // CSV column 3 is latitude
          longitude: parseFloat(values[4] || '0'), // CSV column 4 is longitude
          service: Math.abs(parseInt(values[5] || '0')), // Make service positive, CSV column 5
          delivery: values[6]?.replace(/"/g, ''), // CSV column 6
          skills: skills, // Properly parsed skills array
          time_window_start: values[8]?.replace(/"/g, ''), // CSV column 8
          time_window_end: values[9]?.replace(/"/g, '') // CSV column 9
        };
        
        await turso.execute(
          `INSERT INTO jobs (id, description, location, latitude, longitude, service, delivery, skills, time_window_start, time_window_end) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [job.id, job.description, job.location, job.latitude, job.longitude, job.service, job.delivery, job.skills, job.time_window_start, job.time_window_end]
        );
      }
    }
    
    return { success: true, message: 'Jobs data populated successfully' };
  } catch (error) {
    console.error('Error populating jobs from CSV:', error);
    return { success: false, message: 'Failed to populate jobs data' };
  }
}

// Helper function to parse CSV line properly handling quoted fields
function parseCSVLine(line: string): string[] {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add the last field
  result.push(current);
  
  return result;
}

async function populateVehiclesFromCSV() {
  try {
    // Print DB URL for debugging
    console.log('TURSO_DATABASE_URL:', process.env.TURSO_DATABASE_URL);
    console.log('Starting vehicles import...');
    await ensureVehiclesTable();
    
    const csvPath = path.join(process.cwd(), 'vehicles.csv');
    console.log('CSV path:', csvPath);
    
    if (!fs.existsSync(csvPath)) {
      console.error('vehicles.csv file not found');
      return { success: false, message: 'vehicles.csv file not found' };
    }
    
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n');
    console.log('Total lines in CSV:', lines.length);
    
    // Clear existing data
    await turso.execute('DELETE FROM vehicles');
    console.log('Cleared existing vehicles data');
    
    let importedCount = 0;
    let attemptedCount = 0;
    let failedCount = 0;
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        attemptedCount++;
        try {
          const values = parseCSVLine(lines[i]);
          const vehicle = {
            id: values[0]?.replace(/"/g, ''),
            description: values[1]?.replace(/"/g, ''),
            start_location: values[2]?.replace(/"/g, ''),
            start_latitude: parseFloat(values[3] || '0'),
            start_longitude: parseFloat(values[4] || '0'),
            end_location: values[5]?.replace(/"/g, ''),
            end_latitude: parseFloat(values[6] || '0'),
            end_longitude: parseFloat(values[7] || '0'),
            time_window_start: values[8]?.replace(/"/g, ''),
            time_window_end: values[9]?.replace(/"/g, ''),
            capacity: values[10]?.replace(/"/g, ''),
            alternative_capacities: values[11]?.replace(/"/g, ''),
            skills: values[12]?.replace(/"/g, ''),
            fixed_cost: parseFloat(values[13] || '0'),
            max_tasks: parseInt(values[14] || '0')
          };
          console.log(`Attempting insert for vehicle id: ${vehicle.id}`);
          const insertResult = await turso.execute(
            `INSERT INTO vehicles (id, description, start_location, start_latitude, start_longitude, end_location, end_latitude, end_longitude, time_window_start, time_window_end, capacity, alternative_capacities, skills, fixed_cost, max_tasks) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [vehicle.id, vehicle.description, vehicle.start_location, vehicle.start_latitude, vehicle.start_longitude, vehicle.end_location, vehicle.end_latitude, vehicle.end_longitude, vehicle.time_window_start, vehicle.time_window_end, vehicle.capacity, vehicle.alternative_capacities, vehicle.skills, vehicle.fixed_cost, vehicle.max_tasks]
          );
          console.log(`Insert result for vehicle id ${vehicle.id}:`, insertResult);
          importedCount++;
        } catch (error) {
          failedCount++;
          console.error(`Error processing line ${i} (vehicle id: ${lines[i].split(',')[0]}):`, error);
        }
      }
    }
    console.log(`Import attempted: ${attemptedCount}, successful: ${importedCount}, failed: ${failedCount}`);
    return { success: true, message: `Vehicles data populated successfully. ${importedCount} vehicles imported, ${failedCount} failed.` };
  } catch (error) {
    console.error('Error populating vehicles from CSV:', error);
    const errMsg = (error instanceof Error) ? error.message : String(error);
    return { success: false, message: 'Failed to populate vehicles data', error: errMsg };
  }
}

export async function GET(req: NextRequest) {
  try {
    await ensureTable();
    await ensureJobsTable();
    await ensureVehiclesTable();
    
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get('job_id');
    const dataType = searchParams.get('type'); // 'jobs' or 'vehicles'
    
    if (dataType === 'jobs') {
      // Get all jobs
      const result = await turso.execute('SELECT * FROM jobs ORDER BY id LIMIT 1000');
      const jobs = result.rows.map((row: any) => ({
        id: row.id,
        description: row.description,
        location: row.location,
        latitude: row.latitude,
        longitude: row.longitude,
        service: row.service,
        delivery: row.delivery,
        skills: row.skills,
        time_window_start: row.time_window_start,
        time_window_end: row.time_window_end
      }));
      return NextResponse.json({ jobs });
    }
    
    if (dataType === 'vehicles') {
      // Get all vehicles
      console.log('API TURSO_DATABASE_URL:', process.env.TURSO_DATABASE_URL);
      const tablesResult = await turso.execute("SELECT name FROM sqlite_master WHERE type='table'");
      console.log('API tables found:', tablesResult.rows.map((row: { name: string }) => row.name));
      const schemaResult = await turso.execute("PRAGMA table_info(vehicles)");
      console.log('API vehicles table schema:', schemaResult.rows);
      const countResult = await turso.execute('SELECT COUNT(*) as count FROM vehicles');
      console.log('API vehicles count:', countResult.rows[0]?.count);
      const result = await turso.execute('SELECT * FROM vehicles ORDER BY id LIMIT 1000');
      console.log('API vehicles raw rows:', result.rows);
      
      const vehicles = result.rows.map((row: any) => ({
        id: row.id,
        description: row.description,
        start_location: row.start_location,
        start_latitude: row.start_latitude,
        start_longitude: row.start_longitude,
        end_location: row.end_location,
        end_latitude: row.end_latitude,
        end_longitude: row.end_longitude,
        time_window_start: row.time_window_start,
        time_window_end: row.time_window_end,
        capacity: row.capacity,
        alternative_capacities: row.alternative_capacities,
        skills: row.skills,
        fixed_cost: row.fixed_cost,
        max_tasks: row.max_tasks
      }));
      
      console.log('Mapped vehicles:', vehicles.length);
      if (vehicles.length > 0) {
        console.log('Sample vehicle:', vehicles[0]);
      }
      
      return NextResponse.json({ vehicles });
    }
    
    if (jobId) {
      // Get specific result by job_id
      const result = await turso.execute(
        'SELECT * FROM optimization_results WHERE job_id = ? ORDER BY created_at DESC LIMIT 1',
        [jobId]
      );
      
      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'No optimization result found for this job ID' }, { status: 404 });
      }
      
      const row = result.rows[0];
      try {
        const responseData = JSON.parse(row.response_data as string);
        return NextResponse.json({
          id: row.id,
          job_id: row.job_id,
          response_data: responseData,
          shared_url: row.shared_url,
          created_at: row.created_at,
          status: row.status,
          solution_time: row.solution_time
        });
      } catch (error) {
        console.error('Error parsing response data:', error);
        return NextResponse.json({ error: 'Failed to parse response data' }, { status: 500 });
      }
    } else {
      // Get all results
      const result = await turso.execute(
        'SELECT * FROM optimization_results ORDER BY created_at DESC LIMIT 50'
      );
      
      const results = result.rows.map((row: any) => {
        const baseResult = {
          id: row.id,
          job_id: row.job_id,
          title: row.title,
          shared_url: row.shared_url,
          created_at: row.created_at,
          status: row.status,
          solution_time: row.solution_time
        };
        
        // Include response_data if it exists and is valid JSON
        if (row.response_data) {
          try {
            const responseData = JSON.parse(row.response_data as string);
            return {
              ...baseResult,
              response_data: responseData
            };
          } catch (error) {
            console.error('Error parsing response data for result:', row.id, error);
            return baseResult;
          }
        }
        
        return baseResult;
      });
      
      return NextResponse.json({ results });
    }
  } catch (error) {
    console.error('Database error in GET /api/optimization-results:', error);
    return NextResponse.json(
      { error: 'Database connection failed. Please check your environment variables.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureTable();
    await ensureJobsTable();
    await ensureVehiclesTable();
    
    const body = await req.json();
    const { action, id, job_id, title, response_data, shared_url, status = 'completed', solution_time } = body;
    
    // Handle data population actions
    if (action === 'populate-jobs') {
      const result = await populateJobsFromCSV();
      return NextResponse.json(result);
    }
    
    if (action === 'populate-vehicles') {
      const result = await populateVehiclesFromCSV();
      return NextResponse.json(result);
    }
    
    if (action === 'populate-all') {
      const jobsResult = await populateJobsFromCSV();
      const vehiclesResult = await populateVehiclesFromCSV();
      
      if (jobsResult.success && vehiclesResult.success) {
        return NextResponse.json({ 
          success: true, 
          message: 'All data populated successfully',
          jobs: jobsResult.message,
          vehicles: vehiclesResult.message
        });
      } else {
        return NextResponse.json({ 
          success: false, 
          message: 'Failed to populate some data',
          jobs: jobsResult.message,
          vehicles: vehiclesResult.message
        }, { status: 500 });
      }
    }
    
    // Handle job updates
    if (action === 'update_jobs') {
      const { jobs } = body;
      
      if (!jobs || !Array.isArray(jobs)) {
        return NextResponse.json(
          { error: 'Missing or invalid jobs array' },
          { status: 400 }
        );
      }
      
      try {
        // Update each job
        for (const job of jobs) {
          await turso.execute(
            `UPDATE jobs SET 
             description = ?, 
             location = ?, 
             latitude = ?, 
             longitude = ?, 
             service = ?, 
             delivery = ?, 
             skills = ?, 
             time_window_start = ?, 
             time_window_end = ?
             WHERE id = ?`,
            [
              job.description,
              job.location,
              parseFloat(job.latitude),
              parseFloat(job.longitude),
              parseInt(job.service),
              job.delivery,
              job.skills,
              job.time_window_start,
              job.time_window_end,
              job.id
            ]
          );
        }
        
        return NextResponse.json({ 
          success: true, 
          message: `Successfully updated ${jobs.length} jobs` 
        });
      } catch (error) {
        console.error('Error updating jobs:', error);
        return NextResponse.json(
          { error: 'Failed to update jobs' },
          { status: 500 }
        );
      }
    }
    
    // Handle optimization result saving (existing functionality)
    if (!id || !job_id || !title || !response_data) {
      return NextResponse.json(
        { error: 'Missing required fields: id, job_id, title, response_data' },
        { status: 400 }
      );
    }
    
    await turso.execute(
      'INSERT OR REPLACE INTO optimization_results (id, job_id, title, response_data, shared_url, status, solution_time) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, job_id, title, JSON.stringify(response_data), shared_url, status, solution_time]
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Optimization result saved successfully' 
    });
  } catch (error) {
    console.error('Database error in POST /api/optimization-results:', error);
    return NextResponse.json(
      { error: 'Failed to save optimization result. Please check your database connection.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  await ensureTable();
  
  try {
    const body = await req.json();
    const { id, title, shared_url } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      );
    }
    
    if (title !== undefined) {
      await turso.execute(
        'UPDATE optimization_results SET title = ? WHERE id = ?',
        [title, id]
      );
    }
    
    if (shared_url !== undefined) {
      await turso.execute(
        'UPDATE optimization_results SET shared_url = ? WHERE id = ?',
        [shared_url, id]
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Optimization result updated successfully' 
    });
  } catch (error) {
    console.error('Error updating optimization result:', error);
    return NextResponse.json(
      { error: 'Failed to update optimization result' },
      { status: 500 }
    );
  }
} 

export async function DELETE(req: NextRequest) {
  await ensureTable();
  
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing required parameter: id' },
        { status: 400 }
      );
    }
    
    const result = await turso.execute(
      'DELETE FROM optimization_results WHERE id = ?',
      [id]
    );
    
    if (result.rowsAffected === 0) {
      return NextResponse.json(
        { error: 'Optimization result not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Optimization result deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting optimization result:', error);
    return NextResponse.json(
      { error: 'Failed to delete optimization result' },
      { status: 500 }
    );
  }
} 