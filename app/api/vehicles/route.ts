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
    
    const result = await turso.execute('SELECT * FROM vehicles ORDER BY id LIMIT 1000');
    
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