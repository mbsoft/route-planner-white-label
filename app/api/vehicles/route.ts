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
    
    const vehicles = result.rows.map((row: any) => {
      // Return all columns dynamically
      const vehicle: any = {};
      for (const [key, value] of Object.entries(row)) {
        vehicle[key] = value;
      }
      return vehicle;
    });
    
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
    
    // Get current table schema to check for existing columns
    const schemaResult = await turso.execute("PRAGMA table_info(vehicles)");
    const existingColumns = new Set(schemaResult.rows.map((row: any) => row.name));
    
    const results = [];
    
    for (const vehicle of vehicles) {
      try {
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

        await turso.execute(updateQuery, params);
        
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