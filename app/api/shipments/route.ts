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
    url: 'file:/Users/jimwelch/workspace/route-planner-white-label/local.db',
    syncUrl: undefined,
    authToken: undefined
  });
}

// Convert Unix timestamp to SQLite datetime string
const unixToSqliteDateTime = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return date.toISOString().replace('T', ' ').replace('Z', '');
};

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

export async function GET(request: NextRequest) {
  try {
    // Ensure the shipments table exists
    await ensureShipmentsTable();
    
    const { searchParams } = new URL(request.url);
    const startParam = searchParams.get('start');
    const endParam = searchParams.get('end');
    const searchParam = searchParams.get('search');

    // Debug: Check current table schema
    const schemaResult = await turso.execute("PRAGMA table_info(shipments)");
    console.log('Current shipments table schema:', schemaResult.rows);

    let query = 'SELECT * FROM shipments';
    let params: any[] = [];
    let whereConditions: string[] = [];

    // Build time window conditions for both pickup and delivery
    let timeWindowCondition = '';
    if (startParam && endParam) {
      const startTime = unixToSqliteDateTime(parseInt(startParam));
      const endTime = unixToSqliteDateTime(parseInt(endParam));
      
      timeWindowCondition = `
        (pickup_time_windows >= ? AND pickup_time_windows <= ?) OR
        (pickup_time_windows >= ? AND pickup_time_windows <= ?) OR
        (pickup_time_windows <= ? AND pickup_time_windows >= ?) OR
        (delivery_time_start >= ? AND delivery_time_start <= ?) OR
        (delivery_time_end >= ? AND delivery_time_end <= ?) OR
        (delivery_time_start <= ? AND delivery_time_end >= ?) OR
        (pickup_time_windows = '' OR pickup_time_windows IS NULL OR pickup_time_windows = '' OR pickup_time_windows IS NULL OR
         delivery_time_start = '' OR delivery_time_start IS NULL OR delivery_time_end = '' OR delivery_time_end IS NULL)
      `;
      params.push(startTime, endTime, startTime, endTime, startTime, endTime, startTime, endTime, startTime, endTime, startTime, endTime);
    }

    // Build search conditions
    let searchCondition = '';
    if (searchParam && searchParam.trim()) {
      // Simple substring matching - case insensitive for pickup and delivery descriptions
      searchCondition = '(LOWER(pickup_description) LIKE ? OR LOWER(delivery_description) LIKE ?)';
      const searchTerm = searchParam.toLowerCase();
      params.push(`%${searchTerm}%`, `%${searchTerm}%`);
    }

    // Combine conditions
    if (timeWindowCondition && searchCondition) {
      // Both time window and search filters: records must match time window AND search
      whereConditions.push(`(${timeWindowCondition}) AND (${searchCondition})`);
    } else if (timeWindowCondition) {
      // Only time window filter
      whereConditions.push(timeWindowCondition);
    } else if (searchCondition) {
      // Only search filter
      whereConditions.push(searchCondition);
    }
    // If neither, no conditions (returns all records)

    // Build the final query
    if (whereConditions.length > 0) {
      query = `SELECT * FROM shipments WHERE ${whereConditions.join(' AND ')} ORDER BY pickup_time_windows ASC LIMIT 1000`;
    } else {
      query = 'SELECT * FROM shipments ORDER BY pickup_time_windows ASC LIMIT 1000';
    }

    console.log('Executing query:', query);
    console.log('Query parameters:', params);

    const result = await turso.execute(query, params);
    
    console.log('Raw database result:', result.rows);
    
    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json({ shipments: [] });
    }

    const shipments = result.rows.map((row: any) => {
      // Return all columns dynamically
      const shipment: any = {};
      for (const [key, value] of Object.entries(row)) {
        shipment[key] = value;
      }
      console.log('Processed shipment:', shipment);
      return shipment;
    });

    console.log('Final shipments array:', shipments);

    return NextResponse.json({ shipments });

  } catch (error) {
    console.error('Error fetching shipments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shipments' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Ensure the shipments table exists
    await ensureShipmentsTable();
    
    const body = await request.json();
    const { shipments } = body;

    console.log('PUT /api/shipments - Received shipments:', shipments);

    if (!shipments || !Array.isArray(shipments)) {
      return NextResponse.json(
        { error: 'Invalid request body. Expected shipments array.' },
        { status: 400 }
      );
    }

    // Get current table schema to check for existing columns
    const schemaResult = await turso.execute("PRAGMA table_info(shipments)");
    const existingColumns = new Set(schemaResult.rows.map((row: any) => row.name));
    console.log('Existing columns before update:', Array.from(existingColumns));

    // Update each shipment in the database
    for (const shipment of shipments) {
      if (!shipment.id) {
        continue; // Skip shipments without ID
      }

      console.log(`Processing shipment ${shipment.id}:`, shipment);

      // Check for new columns and add them to the schema
      for (const [key, value] of Object.entries(shipment)) {
        if (key !== 'id' && !existingColumns.has(key)) {
          // Determine column type based on value
          let columnType = 'TEXT';
          if (typeof value === 'number') {
            columnType = value % 1 === 0 ? 'INTEGER' : 'REAL';
          } else if (typeof value === 'boolean') {
            columnType = 'INTEGER';
          }
          
          try {
            await turso.execute(`ALTER TABLE shipments ADD COLUMN ${key} ${columnType}`);
            existingColumns.add(key);
            console.log(`Added new column '${key}' to shipments table`);
          } catch (error) {
            console.error(`Failed to add column '${key}' to shipments table:`, error);
          }
        }
      }

      // Build dynamic INSERT OR REPLACE query with all available columns
      const allFields = Object.keys(shipment);
      const placeholders = allFields.map(() => '?').join(', ');
      const insertQuery = `INSERT OR REPLACE INTO shipments (${allFields.join(', ')}) VALUES (${placeholders})`;

      const params = allFields.map(field => shipment[field] || null);

      console.log(`Executing insert/replace query for shipment ${shipment.id}:`, insertQuery);
      console.log(`Insert parameters:`, params);

      await turso.execute(insertQuery, params);
      console.log(`Successfully inserted/replaced shipment ${shipment.id}`);
    }

    // Verify the data was saved by checking one shipment
    if (shipments.length > 0) {
      const verifyShipment = shipments[0];
      const verifyResult = await turso.execute('SELECT * FROM shipments WHERE id = ?', [verifyShipment.id]);
      console.log('Verification - shipment after save:', verifyResult.rows[0]);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Updated ${shipments.length} shipment(s)` 
    });

  } catch (error) {
    console.error('Error updating shipments:', error);
    return NextResponse.json(
      { error: 'Failed to update shipments' },
      { status: 500 }
    );
  }
}