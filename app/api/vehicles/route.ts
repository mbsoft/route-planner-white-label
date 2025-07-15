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
    
    // Debug: Check current table schema
    const schemaResult = await turso.execute("PRAGMA table_info(vehicles)");
    console.log('Current vehicles table schema:', schemaResult.rows);
    
    let query = 'SELECT * FROM vehicles';
    let params: any[] = [];
    
    if (search) {
      query += ' WHERE description LIKE ?';
      params.push(`%${search}%`);
    }
    
    query += ' ORDER BY id LIMIT 1000';
    
    console.log('Executing vehicles query:', query);
    console.log('Vehicles query parameters:', params);
    
    const result = await turso.execute(query, params);
    
    console.log('Raw vehicles database result:', result.rows);
    
    const vehicles = result.rows.map((row: any) => {
      // Return all columns dynamically
      const vehicle: any = {};
      for (const [key, value] of Object.entries(row)) {
        vehicle[key] = value;
      }
      console.log('Processed vehicle:', vehicle);
      return vehicle;
    });
    
    console.log('Final vehicles array:', vehicles);
    
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
    
    console.log('PUT /api/vehicles - Received vehicles:', vehicles);
    
    if (!vehicles || !Array.isArray(vehicles)) {
      return NextResponse.json(
        { error: 'Invalid request body. Expected vehicles array.' },
        { status: 400 }
      );
    }
    
    // Get current table schema to check for existing columns
    const schemaResult = await turso.execute("PRAGMA table_info(vehicles)");
    const existingColumns = new Set(schemaResult.rows.map((row: any) => row.name));
    console.log('Existing columns before update:', Array.from(existingColumns));
    
    const results = [];
    
    for (const vehicle of vehicles) {
      try {
        console.log(`Processing vehicle ${vehicle.id}:`, vehicle);
        
        // Check for new columns and add them to the schema
        for (const [key, value] of Object.entries(vehicle)) {
          if (key !== 'id' && !existingColumns.has(key)) {
            // Determine column type based on value
            let columnType = 'TEXT';
            if (typeof value === 'number') {
              columnType = value % 1 === 0 ? 'INTEGER' : 'REAL';
            } else if (typeof value === 'boolean') {
              columnType = 'INTEGER';
            }
            
            try {
              await turso.execute(`ALTER TABLE vehicles ADD COLUMN ${key} ${columnType}`);
              existingColumns.add(key);
              console.log(`Added new column '${key}' to vehicles table`);
            } catch (error) {
              console.error(`Failed to add column '${key}' to vehicles table:`, error);
            }
          }
        }

        // Build dynamic UPDATE query with all available columns
        const updateFields = Object.keys(vehicle).filter(key => key !== 'id');
        const setClause = updateFields.map(field => `${field} = ?`).join(', ');
        const updateQuery = `UPDATE vehicles SET ${setClause} WHERE id = ?`;

        const params = [
          ...updateFields.map(field => vehicle[field] || null),
          vehicle.id
        ];

        console.log(`Executing update query for vehicle ${vehicle.id}:`, updateQuery);
        console.log(`Update parameters:`, params);

        await turso.execute(updateQuery, params);
        console.log(`Successfully updated vehicle ${vehicle.id}`);
        
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
    
    // Verify the data was saved by checking one vehicle
    if (vehicles.length > 0) {
      const verifyVehicle = vehicles[0];
      const verifyResult = await turso.execute('SELECT * FROM vehicles WHERE id = ?', [verifyVehicle.id]);
      console.log('Verification - vehicle after save:', verifyResult.rows[0]);
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