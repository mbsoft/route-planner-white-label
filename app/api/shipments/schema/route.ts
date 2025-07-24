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
      id TEXT PRIMARY KEY,
      -- Pickup step fields
      pickup_id TEXT,
      pickup_description TEXT,
      pickup_location_index INTEGER,
      pickup_service INTEGER,
      pickup_setup INTEGER,
      pickup_time_windows TEXT,
      -- Delivery step fields
      delivery_id TEXT,
      delivery_description TEXT,
      delivery_location_index INTEGER,
      delivery_service INTEGER,
      delivery_setup INTEGER,
      delivery_time_windows TEXT,
      -- Shipment level fields
      amount TEXT,
      skills TEXT,
      priority INTEGER,
      zones TEXT,
      load_types TEXT,
      incompatible_load_types TEXT,
      max_time_in_vehicle INTEGER,
      revenue INTEGER,
      outsourcing_cost INTEGER,
      follow_lifo_order INTEGER,
      volume TEXT,
      joint_order INTEGER
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