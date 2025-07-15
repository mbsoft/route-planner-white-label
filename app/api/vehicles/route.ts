import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

// Check if Turso environment variables are set
const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

let turso: any;

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

async function ensureVehiclesTable() {
  // Create vehicles table if it doesn't exist
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

export async function GET(req: NextRequest) {
  try {
    await ensureVehiclesTable();
    
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    
    let query = 'SELECT * FROM vehicles';
    let params: any[] = [];
    
    if (search) {
      query += ' WHERE description LIKE ?';
      params.push(`%${search}%`);
    }
    
    query += ' ORDER BY id LIMIT 1000';
    
    const result = await turso.execute(query, params);
    
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
    
    return NextResponse.json({ vehicles });
  } catch (error) {
    console.error('Database error in GET /api/vehicles:', error);
    return NextResponse.json(
      { error: 'Database connection failed. Please check your environment variables.' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await ensureVehiclesTable();
    
    const body = await req.json();
    const { vehicles } = body;
    
    if (!vehicles || !Array.isArray(vehicles)) {
      return NextResponse.json(
        { error: 'Invalid request body. Expected vehicles array.' },
        { status: 400 }
      );
    }
    
    const results = [];
    
    for (const vehicle of vehicles) {
      try {
        // Update the vehicle in the database
        const result = await turso.execute(`
          UPDATE vehicles SET 
            description = ?,
            start_location = ?,
            start_latitude = ?,
            start_longitude = ?,
            end_location = ?,
            end_latitude = ?,
            end_longitude = ?,
            time_window_start = ?,
            time_window_end = ?,
            capacity = ?,
            alternative_capacities = ?,
            skills = ?,
            fixed_cost = ?,
            max_tasks = ?
          WHERE id = ?
        `, [
          vehicle.description || null,
          vehicle.start_location || null,
          vehicle.start_latitude || null,
          vehicle.start_longitude || null,
          vehicle.end_location || null,
          vehicle.end_latitude || null,
          vehicle.end_longitude || null,
          vehicle.time_window_start || null,
          vehicle.time_window_end || null,
          vehicle.capacity || null,
          vehicle.alternative_capacities || null,
          vehicle.skills || null,
          vehicle.fixed_cost || null,
          vehicle.max_tasks || null,
          vehicle.id
        ]);
        
        results.push({
          id: vehicle.id,
          success: true,
          message: 'Vehicle updated successfully'
        });
      } catch (error) {
        console.error(`Error updating vehicle ${vehicle.id}:`, error);
        results.push({
          id: vehicle.id,
          success: false,
          message: 'Failed to update vehicle'
        });
      }
    }
    
    return NextResponse.json({ 
      message: 'Vehicles update completed',
      results 
    });
  } catch (error) {
    console.error('Database error in PUT /api/vehicles:', error);
    return NextResponse.json(
      { error: 'Database connection failed. Please check your environment variables.' },
      { status: 500 }
    );
  }
} 