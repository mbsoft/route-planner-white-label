const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Manual parsing function for the malformed CSV
function parseVehicleLine(line) {
  try {
    // Remove any trailing whitespace
    line = line.trim();
    if (!line) return null;
    
    // Extract the vehicle ID (first quoted field)
    const idMatch = line.match(/^"([^"]+)"/);
    if (!idMatch) return null;
    const id = idMatch[1];
    
    // Extract description (second quoted field)
    const descMatch = line.match(/"([^"]+)",([^,]+),([^,]+),/);
    if (!descMatch) return null;
    const description = descMatch[1];
    const startLat = descMatch[2];
    const startLng = descMatch[3];
    
    // Extract end location coordinates
    const endMatch = line.match(/"([^"]+)",([^,]+),([^,]+),/g);
    if (!endMatch || endMatch.length < 2) return null;
    const endCoords = endMatch[1].match(/"([^"]+)",([^,]+),([^,]+)/);
    const endLocation = endCoords[1];
    const endLat = endCoords[2];
    const endLng = endCoords[3];
    
    // Extract time windows
    const timeMatch = line.match(/"([^"]+)","([^"]+)"/);
    if (!timeMatch) return null;
    const timeWindowStart = timeMatch[1];
    const timeWindowEnd = timeMatch[2];
    
    // Extract capacity (simple array)
    const capacityMatch = line.match(/"(\[[^\]]+\])"/);
    if (!capacityMatch) return null;
    const capacity = capacityMatch[1];
    
    // Extract alternative capacities (complex array - everything after capacity until end)
    const altCapMatch = line.match(/"(\[[^\]]+\])"$/);
    if (!altCapMatch) return null;
    const alternativeCapacities = altCapMatch[1];
    
    return {
      id: id,
      description: description,
      start_location: description, // Use description as start location
      start_latitude: parseFloat(startLat) || 0,
      start_longitude: parseFloat(startLng) || 0,
      end_location: endLocation,
      end_latitude: parseFloat(endLat) || 0,
      end_longitude: parseFloat(endLng) || 0,
      time_window_start: timeWindowStart,
      time_window_end: timeWindowEnd,
      capacity: capacity,
      alternative_capacities: alternativeCapacities,
      skills: '', // Default empty string
      fixed_cost: 0, // Default 0
      max_tasks: 0 // Default 0
    };
  } catch (error) {
    console.error('Error parsing line:', error);
    return null;
  }
}

async function importVehiclesFixed() {
  try {
    console.log('Connecting to Turso cloud database...');
    
    // Initialize Turso client with environment variables
    const turso = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    
    console.log('✅ Connected to Turso cloud database');
    
    // First, clear existing vehicles
    console.log('Deleting existing vehicles from cloud database...');
    await turso.execute('DELETE FROM vehicles');
    console.log('✅ Existing vehicles deleted from cloud database');
    
    // Read CSV file
    const csvPath = path.join(process.cwd(), 'vehicles.csv');
    console.log('Reading CSV file:', csvPath);
    
    if (!fs.existsSync(csvPath)) {
      console.error('❌ vehicles.csv file not found');
      return;
    }
    
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n');
    console.log('Total lines in CSV:', lines.length);
    
    let importedCount = 0;
    let errorCount = 0;
    
    // Process each line (skip header)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        try {
          console.log(`Processing line ${i}:`);
          console.log(`Raw line: ${line.substring(0, 100)}...`);
          
          const vehicle = parseVehicleLine(line);
          
          if (!vehicle) {
            console.error(`❌ Failed to parse line ${i}`);
            errorCount++;
            continue;
          }
          
          console.log('Parsed vehicle:', {
            id: vehicle.id,
            description: vehicle.description,
            start_lat: vehicle.start_latitude,
            start_lng: vehicle.start_longitude
          });
          
          await turso.execute(
            `INSERT INTO vehicles (id, description, start_location, start_latitude, start_longitude, end_location, end_latitude, end_longitude, time_window_start, time_window_end, capacity, alternative_capacities, skills, fixed_cost, max_tasks) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [vehicle.id, vehicle.description, vehicle.start_location, vehicle.start_latitude, vehicle.start_longitude, vehicle.end_location, vehicle.end_latitude, vehicle.end_longitude, vehicle.time_window_start, vehicle.time_window_end, vehicle.capacity, vehicle.alternative_capacities, vehicle.skills, vehicle.fixed_cost, vehicle.max_tasks]
          );
          
          importedCount++;
          console.log(`✅ Inserted vehicle ${vehicle.id}`);
        } catch (error) {
          console.error(`Error processing line ${i}:`, error);
          errorCount++;
        }
      }
    }
    
    console.log(`\n📊 Import Summary:`);
    console.log(`✅ Successfully imported: ${importedCount} vehicles`);
    console.log(`❌ Errors: ${errorCount} vehicles`);
    
    // Verify the import
    const result = await turso.execute('SELECT COUNT(*) as count FROM vehicles');
    console.log(`📈 Total vehicles in cloud database: ${result.rows[0].count}`);
    
    console.log('✅ Import completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during import:', error);
  }
}

importVehiclesFixed(); 