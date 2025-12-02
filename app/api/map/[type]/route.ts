import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

// Database configuration
const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;
const localSqliteUrl = process.env.LOCAL_SQLITE_DB_URL || 'file:./local.db';

let turso: any;

// Prefer an explicit local SQLite URL if provided, otherwise fall back to Turso
if (localSqliteUrl && !localSqliteUrl.includes('your_local_sqlite_db_url_here')) {
  console.log(`Using local SQLite database at ${localSqliteUrl} for map configs`);
  turso = createClient({
    url: localSqliteUrl,
    syncUrl: undefined,
    authToken: undefined,
  });
} else if (tursoUrl && tursoAuthToken && !tursoUrl.includes('your_turso_database_url_here')) {
  console.log('Using Turso database for map configs');
  turso = createClient({ url: tursoUrl, authToken: tursoAuthToken });
} else {
  console.warn('No valid database URL configured, falling back to file:./local.db for map configs');
  turso = createClient({
    url: 'file:./local.db',
    syncUrl: undefined,
    authToken: undefined,
  });
}

async function ensureTable() {
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS map_configs (
      type TEXT PRIMARY KEY,
      data TEXT
    )
  `);
}

export async function GET(req: NextRequest, { params }: { params: { type: string } }) {
  await ensureTable();
  const type = params.type;
  const result = await turso.execute('SELECT data FROM map_configs WHERE type = ?', [type]);
  const row = result.rows[0];
  let value = null;
  if (row && typeof row.data === 'string') {
    try {
      value = JSON.parse(row.data);
    } catch {
      value = null;
    }
  }
  return NextResponse.json({ value });
}

export async function POST(req: NextRequest, { params }: { params: { type: string } }) {
  await ensureTable();
  const type = params.type;
  const body = await req.json();
  await turso.execute(
    'INSERT OR REPLACE INTO map_configs (type, data) VALUES (?, ?)',
    [type, JSON.stringify(body)]
  );
  return NextResponse.json({ ok: true });
} 