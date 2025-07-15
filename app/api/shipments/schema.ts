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

async function ensureShipmentsTable() {
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS shipments (
      id TEXT PRIMARY KEY
      -- Add other default columns as needed
    )
  `);
}

export async function GET(req: NextRequest) {
  try {
    await ensureShipmentsTable();
    const schemaResult = await turso.execute("PRAGMA table_info(shipments)");
    const columns = schemaResult.rows.map((row: any) => row.name);
    return NextResponse.json({ columns });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch shipments schema' }, { status: 500 });
  }
} 