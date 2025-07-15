import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

let turso: any;

if (tursoUrl && tursoAuthToken && !tursoUrl.includes('your_turso_database_url_here')) {
  turso = createClient({ url: tursoUrl, authToken: tursoAuthToken });
} else {
  turso = createClient({ 
    url: 'file:./local.db',
    syncUrl: undefined,
    authToken: undefined
  });
}

async function ensureJobsTable() {
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      description TEXT,
      location_index INTEGER,
      delivery TEXT,
      pickup TEXT,
      service INTEGER,
      time_windows TEXT,
      skills TEXT,
      priority INTEGER,
      setup INTEGER,
      zones TEXT,
      metadata TEXT,
      depot_ids TEXT,
      load_types TEXT,
      incompatible_load_types TEXT,
      sequence_order INTEGER,
      revenue INTEGER,
      outsourcing_cost INTEGER,
      follow_lifo_order INTEGER,
      max_visit_lateness INTEGER,
      volume TEXT,
      joint_order INTEGER
    )
  `);
}

export async function GET(req: NextRequest) {
  try {
    await ensureJobsTable();
    const schemaResult = await turso.execute("PRAGMA table_info(jobs)");
    const columns = schemaResult.rows.map((row: any) => row.name);
    return NextResponse.json({ columns });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch jobs schema' }, { status: 500 });
  }
} 