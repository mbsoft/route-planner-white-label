import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

// Vehicle field type mapping based on NextBillion.ai API schema
const VEHICLE_FIELD_TYPES: { [key: string]: 'string' | 'integer' | 'real' | 'boolean' | 'array' | 'object' } = {
  // Core fields
  id: 'string',
  description: 'string',
  
  // Location fields
  start_index: 'integer',
  end_index: 'integer',
  start_depot_ids: 'array',
  end_depot_ids: 'array',
  start_location: 'string',
  start_latitude: 'real',
  start_longitude: 'real',
  end_location: 'string',
  end_latitude: 'real',
  end_longitude: 'real',
  
  // Time fields
  time_window_start: 'string',
  time_window_end: 'string',
  time_window: 'array',
  
  // Capacity fields
  capacity: 'array',
  alternative_capacities: 'array',
  
  // Skills and constraints
  skills: 'array',
  max_tasks: 'integer',
  max_distance: 'integer',
  max_travel_time: 'integer',
  max_stops: 'integer',
  max_working_time: 'integer',
  max_depot_runs: 'integer',
  max_travel_cost: 'integer',
  
  // Cost fields
  fixed_cost: 'integer',
  per_hour: 'integer',
  per_km: 'integer',
  per_order: 'integer',
  
  // Other fields
  speed_factor: 'real',
  profile: 'string',
  allowed_zones: 'array',
  restricted_zones: 'array',
  metadata: 'object',
  
  // Volume fields
  volume_width: 'real',
  volume_depth: 'real',
  volume_height: 'real',
  
  // Custom fields (will default to string)
  created_at: 'string'
};

// Check if Turso environment variables are set
const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

let turso: any;

// Function to convert value to appropriate type based on API schema
function convertValueToSchemaType(fieldName: string, value: any): any {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  
  const fieldType = VEHICLE_FIELD_TYPES[fieldName] || 'string';
  
  switch (fieldType) {
    case 'integer':
      return typeof value === 'string' ? parseInt(value, 10) : Math.floor(Number(value));
    case 'real':
      return typeof value === 'string' ? parseFloat(value) : Number(value);
    case 'boolean':
      return typeof value === 'string' ? value.toLowerCase() === 'true' : Boolean(value);
    case 'array':
      return typeof value === 'string' ? JSON.parse(value) : value;
    case 'object':
      return typeof value === 'string' ? JSON.parse(value) : value;
    case 'string':
    default:
      return String(value);
  }
}

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
    
    // Debug: Check current table schema
    const schemaResult = await turso.execute("PRAGMA table_info(vehicles)");
    console.log('Current vehicles table schema:', schemaResult.rows);
    
    let query = 'SELECT * FROM vehicles';
    let params: any[] = [];
    
    if (search) {
      query += ' WHERE description LIKE ?';
      params.push(`%${search}%`);
    }
    
    query += ' ORDER BY id LIMIT 1000';
    
    console.log('Executing vehicles query:', query);
    console.log('Vehicles query parameters:', params);
    
    const result = await turso.execute(query, params);
    
    console.log('Raw vehicles database result:', result.rows);
    
    const vehicles = result.rows.map((row: any) => {
      // Return all columns dynamically
      const vehicle: any = {};
      for (const [key, value] of Object.entries(row)) {
        vehicle[key] = value;
      }
      console.log('Processed vehicle:', vehicle);
      return vehicle;
    });
    
    console.log('Final vehicles array:', vehicles);
    
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
    
    console.log('PUT /api/vehicles - Received vehicles:', vehicles);
    
    if (!vehicles || !Array.isArray(vehicles)) {
      return NextResponse.json(
        { error: 'Invalid request body. Expected vehicles array.' },
        { status: 400 }
      );
    }
    
    // Get current table schema to check for existing columns
    const schemaResult = await turso.execute("PRAGMA table_info(vehicles)");
    const existingColumns = new Set(schemaResult.rows.map((row: any) => row.name));
    console.log('Existing columns before update:', Array.from(existingColumns));
    
    const results = [];
    
    for (const vehicle of vehicles) {
      try {
        console.log(`Processing vehicle ${vehicle.id}:`, vehicle);
        
        // Check for new columns and add them to the schema
        for (const [key, value] of Object.entries(vehicle)) {
          if (key !== 'id' && !existingColumns.has(key)) {
            // Determine column type based on API schema
            const fieldType = VEHICLE_FIELD_TYPES[key] || 'string';
            let columnType = 'TEXT';
            
            switch (fieldType) {
              case 'integer':
                columnType = 'INTEGER';
                break;
              case 'real':
                columnType = 'REAL';
                break;
              case 'boolean':
                columnType = 'INTEGER';
                break;
              case 'array':
              case 'object':
                columnType = 'TEXT'; // Store as JSON string
                break;
              case 'string':
              default:
                columnType = 'TEXT';
                break;
            }
            
            try {
              await turso.execute(`ALTER TABLE vehicles ADD COLUMN ${key} ${columnType}`);
              existingColumns.add(key);
              console.log(`Added new column '${key}' to vehicles table with type ${columnType}`);
            } catch (error) {
              console.error(`Failed to add column '${key}' to vehicles table:`, error);
            }
          }
        }

        // Build dynamic UPDATE query with all available columns
        const updateFields = Object.keys(vehicle).filter(key => key !== 'id');
        const setClause = updateFields.map(field => `${field} = ?`).join(', ');
        const updateQuery = `UPDATE vehicles SET ${setClause} WHERE id = ?`;

        // Convert values to appropriate types based on API schema
        const params = [
          ...updateFields.map(field => {
            const value = vehicle[field];
            const convertedValue = convertValueToSchemaType(field, value);
            console.log(`Field: ${field}, Original: ${value} (${typeof value}), Converted: ${convertedValue} (${typeof convertedValue})`);
            return convertedValue;
          }),
          vehicle.id
        ];

        console.log(`Executing update query for vehicle ${vehicle.id}:`, updateQuery);
        console.log(`Update parameters:`, params);
        console.log(`Parameter types:`, params.map(p => typeof p));

        const result = await turso.execute(updateQuery, params);
        console.log(`Successfully updated vehicle ${vehicle.id}`, result);
        
        results.push({
          id: vehicle.id,
          success: true,
          message: 'Vehicle updated successfully'
        });
      } catch (error: any) {
        console.error(`Error updating vehicle ${vehicle.id}:`, error);
        console.error(`Error details:`, {
          message: error.message,
          code: error.code,
          cause: error.cause
        });
        results.push({
          id: vehicle.id,
          success: false,
          message: `Failed to update vehicle: ${error.message}`
        });
      }
    }
    
    // Verify the data was saved by checking one vehicle
    if (vehicles.length > 0) {
      const verifyVehicle = vehicles[0];
      const verifyResult = await turso.execute('SELECT * FROM vehicles WHERE id = ?', [verifyVehicle.id]);
      console.log('Verification - vehicle after save:', verifyResult.rows[0]);
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