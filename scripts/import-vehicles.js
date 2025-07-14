#!/usr/bin/env node

// Polyfill for Node.js < 18
if (!global.Request) {
  global.Request = require('node-fetch').Request;
}

const fs = require('fs');
const path = require('path');
const { createClient } = require('@libsql/client');

// Database configuration
const tursoUrl = "libsql://database-nextbillion-ai-vercel-icfg-8q0hg5durahw4z8yicsumesi.aws-us-east-1.turso.io";
const tursoAuthToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NTIxODkyMzQsImlkIjoiMjgzOWIwNmQtM2E2Yy00ZmI3LWIzODItOWUzZWVkNzcyYTE4IiwicmlkIjoiMGViNzQ4YzgtOGRlOS00OWY2LWI4NTYtM2FmYTEwMDJhOTYzIn0.Zufeq7xw4edGSGBfaLudbP-jd7LaI3Og98Bepv-b_keaRCVn34bL6P4-5K5TQNYSOwzUqeDbJ0VBhmwN99y6Bg";

let turso;

if (tursoUrl && tursoAuthToken && !tursoUrl.includes('your_turso_database_url_here')) {
  // Use Turso if environment variables are properly set
  turso = createClient({ url: tursoUrl, authToken: tursoAuthToken });
  console.log('✅ Using Turso database');
} else {
  // Fallback to local SQLite for development
  console.log('⚠️  Turso environment variables not set, using local SQLite database');
  turso = createClient({ 
    url: 'file:./local.db',
    syncUrl: undefined,
    authToken: undefined
  });
}

// CSV parsing function to handle quoted fields
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

// Convert Unix timestamp to SQLite datetime string
function unixToSqliteDateTime(timestamp) {
  if (!timestamp) return null;
  const date = new Date(timestamp * 1000);
  return date.toISOString().replace('T', ' ').replace('Z', '');
}

// Ensure vehicles table exists
async function ensureVehiclesTable() {
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
  console.log('✅ Vehicles table ensured');
}

// Import vehicles from CSV
async function importVehicles(csvFilePath) {
  try {
    console.log(`📁 Reading CSV file: ${csvFilePath}`);
    
    if (!fs.existsSync(csvFilePath)) {
      throw new Error(`CSV file not found: ${csvFilePath}`);
    }
    
    const csvContent = fs.readFileSync(csvFilePath, 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header and one data row');
    }
    
    console.log(`📊 Found ${lines.length - 1} vehicle records to import`);
    
    // Clear existing data (optional - comment out if you want to append)
    //console.log('🗑️  Clearing existing vehicles data...');
      //await turso.execute('DELETE FROM vehicles');
    
    let importedCount = 0;
    let errorCount = 0;
    
    // Process each line (skip header)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      try {
        const values = parseCSVLine(line);
        
        if (values.length < 15) {
          console.warn(`⚠️  Line ${i + 1}: Insufficient columns (${values.length}), skipping`);
          errorCount++;
          continue;
        }
        
        // Parse the vehicle data
        const vehicle = {
          id: values[0]?.replace(/"/g, '') || '',
          description: values[1]?.replace(/"/g, '') || '',
          start_location: values[2]?.replace(/"/g, '') || '',
          start_latitude: parseFloat(values[3]) || 0,
          start_longitude: parseFloat(values[4]) || 0,
          end_location: values[5]?.replace(/"/g, '') || '',
          end_latitude: parseFloat(values[6]) || 0,
          end_longitude: parseFloat(values[7]) || 0,
          time_window_start: values[8]?.replace(/"/g, '') || null,
          time_window_end: values[9]?.replace(/"/g, '') || null,
          capacity: values[10]?.replace(/"/g, '') || '[]',
          alternative_capacities: values[11]?.replace(/"/g, '') || '[]',
          skills: values[12]?.replace(/"/g, '') || '[]',
          fixed_cost: parseFloat(values[13]) || 0,
          max_tasks: parseInt(values[14]) || 0
        };
        
        // Validate required fields
        if (!vehicle.id) {
          console.warn(`⚠️  Line ${i + 1}: Missing vehicle ID, skipping`);
          errorCount++;
          continue;
        }
        
        // Insert the vehicle
        await turso.execute(
          `INSERT INTO vehicles (id, description, start_location, start_latitude, start_longitude, end_location, end_latitude, end_longitude, time_window_start, time_window_end, capacity, alternative_capacities, skills, fixed_cost, max_tasks) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [vehicle.id, vehicle.description, vehicle.start_location, vehicle.start_latitude, vehicle.start_longitude, vehicle.end_location, vehicle.end_latitude, vehicle.end_longitude, vehicle.time_window_start, vehicle.time_window_end, vehicle.capacity, vehicle.alternative_capacities, vehicle.skills, vehicle.fixed_cost, vehicle.max_tasks]
        );
        
        importedCount++;
        
        if (importedCount % 5 === 0) {
          console.log(`📈 Imported ${importedCount} vehicles...`);
        }
        
      } catch (error) {
        console.error(`❌ Error processing line ${i + 1}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\n✅ Import completed!`);
    console.log(`📊 Successfully imported: ${importedCount} vehicles`);
    console.log(`❌ Errors: ${errorCount} records`);
    
    // Verify the import
    const result = await turso.execute('SELECT COUNT(*) as count FROM vehicles');
    console.log(`🗄️  Total vehicles in database: ${result.rows[0].count}`);
    
    // Show a sample vehicle
    const sampleResult = await turso.execute('SELECT * FROM vehicles LIMIT 1');
    if (sampleResult.rows.length > 0) {
      console.log('\n📋 Sample imported vehicle:');
      console.log(JSON.stringify(sampleResult.rows[0], null, 2));
    }
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  }
}

// Main function
async function main() {
  try {
    // Get CSV file path from command line argument or use default
    const csvFilePath = process.argv[2] || 'vehicles_tampa.csv';
    
    console.log('🚀 Starting vehicles import...');
    console.log(`📁 CSV file: ${csvFilePath}`);
    console.log('---');
    
    // Ensure table exists
    await ensureVehiclesTable();
    
    // Import vehicles
    await importVehicles(csvFilePath);
    
    console.log('\n🎉 Vehicles import completed successfully!');
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { importVehicles, ensureVehiclesTable }; 