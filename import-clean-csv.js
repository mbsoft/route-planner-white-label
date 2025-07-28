const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Helper function to parse CSV line properly handling quoted fields
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add the last field
  result.push(current);
  
  return result;
}

async function importCleanCSV() {
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
    
    // Read clean CSV file
    const csvPath = path.join(process.cwd(), 'vehicles_phoenix.csv');
    console.log('Reading clean CSV file:', csvPath);
    
    if (!fs.existsSync(csvPath)) {
      console.error('❌ csv file not found');
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
          const values = parseCSVLine(line);
          console.log(`Processing line ${i}: ${values.length} fields`);
          
          const vehicle = {
            id: values[0]?.replace(/"/g, ''),
            description: values[1]?.replace(/"/g, ''),
            start_location: values[2]?.replace(/"/g, ''),
            start_latitude: parseFloat(values[3] || '0'),
            start_longitude: parseFloat(values[4] || '0'),
            end_location: values[5]?.replace(/"/g, ''),
            end_latitude: parseFloat(values[6] || '0'),
            end_longitude: parseFloat(values[7] || '0'),
            time_window_start: values[8]?.replace(/"/g, ''),
            time_window_end: values[9]?.replace(/"/g, ''),
            capacity: values[10]?.replace(/"/g, ''),
            alternative_capacities: values[11]?.replace(/"/g, '') || '',
            skills: values[12]?.replace(/"/g, '') || '',
            fixed_cost: parseFloat(values[13] || '0'),
            max_tasks: parseInt(values[14] || '0')
          };
          
          console.log('Inserting vehicle:', vehicle.id);
          
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

importCleanCSV(); 