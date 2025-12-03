import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

// Database configuration
const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;
const localSqliteUrl = process.env.LOCAL_SQLITE_DB_URL || 'file:./local.db';

let turso: any;

// Prefer an explicit local SQLite URL if provided, otherwise fall back to Turso
if (localSqliteUrl && !localSqliteUrl.includes('your_local_sqlite_db_url_here')) {
  console.log(`Using local SQLite database at ${localSqliteUrl} for shipments schema`);
  turso = createClient({
    url: localSqliteUrl,
    syncUrl: undefined,
    authToken: undefined,
  });
} else if (tursoUrl && tursoAuthToken && !tursoUrl.includes('your_turso_database_url_here')) {
  console.log('Using Turso database for shipments schema');
  turso = createClient({ url: tursoUrl, authToken: tursoAuthToken });
} else {
  console.warn('No valid database URL configured, falling back to file:./local.db for shipments schema');
  turso = createClient({
    url: 'file:./local.db',
    syncUrl: undefined,
    authToken: undefined,
  });
}

async function ensureShipmentsTable() {
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS shipments (
      id TEXT PRIMARY KEY,
      -- Pickup step fields
      pickup_id TEXT,
      pickup_description TEXT,
      pickup_location TEXT,
      pickup_location_index INTEGER,
      pickup_service INTEGER,
      pickup_setup INTEGER,
      pickup_time_windows TEXT,
      -- Delivery step fields
      delivery_id TEXT,
      delivery_description TEXT,
      delivery_location TEXT,
      delivery_location_index INTEGER,
      delivery_service INTEGER,
      delivery_setup INTEGER,
      delivery_time_start TEXT,
      delivery_time_end TEXT,
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
    
    // Explicitly define the columns to ensure all are included
    const columns = [
      'id',
      'pickup_id',
      'pickup_description',
      'pickup_location',
      'pickup_location_index',
      'pickup_service',
      'pickup_setup',
      'pickup_time_windows',
      'delivery_id',
      'delivery_description',
      'delivery_location',
      'delivery_location_index',
      'delivery_service',
      'delivery_setup',
      'delivery_time_start',
      'delivery_time_end',
      'amount',
      'skills',
      'priority',
      'zones',
      'load_types',
      'incompatible_load_types',
      'max_time_in_vehicle',
      'revenue',
      'outsourcing_cost',
      'follow_lifo_order',
      'volume',
      'joint_order'
    ];
    
    return NextResponse.json({ columns });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch shipments schema' }, { status: 500 });
  }
} 