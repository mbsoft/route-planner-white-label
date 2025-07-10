import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

const tursoUrl = process.env.TURSO_DATABASE_URL!;
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN!;

const turso = createClient({ url: tursoUrl, authToken: tursoAuthToken });

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