import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

// Database configuration
const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;
const localSqliteUrl = process.env.LOCAL_SQLITE_DB_URL || 'file:./local.db';

let turso: any;

// Prefer an explicit local SQLite URL if provided, otherwise fall back to Turso
if (localSqliteUrl && !localSqliteUrl.includes('your_local_sqlite_db_url_here')) {
  console.log(`Using local SQLite database at ${localSqliteUrl} for vehicles schema`);
  turso = createClient({
    url: localSqliteUrl,
    syncUrl: undefined,
    authToken: undefined,
  });
} else if (tursoUrl && tursoAuthToken && !tursoUrl.includes('your_turso_database_url_here')) {
  console.log('Using Turso database for vehicles schema');
  turso = createClient({ url: tursoUrl, authToken: tursoAuthToken });
} else {
  console.warn('No valid database URL configured, falling back to file:./local.db for vehicles schema');
  turso = createClient({
    url: 'file:./local.db',
    syncUrl: undefined,
    authToken: undefined,
  });
}

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
}

export async function GET(req: NextRequest) {
  try {
    await ensureVehiclesTable();
    const schemaResult = await turso.execute("PRAGMA table_info(vehicles)");
    const columns = schemaResult.rows.map((row: any) => row.name);
    return NextResponse.json({ columns });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch vehicles schema' }, { status: 500 });
  }
} 