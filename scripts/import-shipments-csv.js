const fs = require('fs');
const path = require('path');
const { createClient } = require('@libsql/client');

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

async function importShipmentsFromCSV() {
  try {
    console.log('🚀 Starting shipments import from CSV...');
    
    // Initialize database client
    const tursoUrl = process.env.TURSO_DATABASE_URL;
    const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;
    
    let turso;
    
    if (tursoUrl && tursoAuthToken) {
      turso = createClient({ url: tursoUrl, authToken: tursoAuthToken });
      console.log('📡 Using Turso database');
    } else {
      turso = createClient({ 
        url: 'file:./local.db',
        syncUrl: undefined,
        authToken: undefined
      });
      console.log('💾 Using local SQLite database');
    }
    
    // Ensure shipments table exists
    console.log('🔧 Ensuring shipments table exists...');
    //await turso.execute('DROP TABLE IF EXISTS shipments');
    
    // Read CSV file
    const csvPath = path.join(process.cwd(), 'shipments_tampa.csv');
    console.log('📖 Reading CSV file:', csvPath);
    
    if (!fs.existsSync(csvPath)) {
      console.error('❌ CSV file not found:', csvPath);
      return;
    }
    
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n');
    console.log('📊 Total lines in CSV:', lines.length);
    
    // Parse header
    const header = parseCSVLine(lines[0]);
    console.log('📋 CSV header:', header);
    
    // Delete all existing shipments
    console.log('🗑️  Deleting all existing shipments...');
    //const deleteResult = await turso.execute('DELETE FROM shipments');
    console.log(`✅ Deleted ${deleteResult.rowsAffected} existing shipments`);
    
    let importedCount = 0;
    let errorCount = 0;
    const shipments = [];
    
    // Process each line (skip header)
    console.log('🔄 Processing CSV data...');
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        try {
          const values = parseCSVLine(line);
          
          // Create shipment object from CSV values
          const shipment = {};
          header.forEach((key, index) => {
            shipment[key] = values[index];
          });
          
          // Transform data for database
          const dbShipment = {
            id: shipment.pickup_id?.replace(/"/g, ''), // Use pickup_id as the primary ID
            pickup_id: shipment.pickup_id?.replace(/"/g, ''),
            pickup_description: shipment.pickup_description?.replace(/"/g, ''),
            pickup_location: shipment.pickup_location?.replace(/"/g, ''),
            pickup_location_index: null, // Will be set during optimization
            pickup_service: 0, // Default service time
            pickup_setup: parseInt(shipment.pickup_setup) || 0,
            pickup_time_windows: null, // No pickup time windows in CSV
            delivery_id: shipment.delivery_id?.replace(/"/g, ''),
            delivery_description: shipment.delivery_description?.replace(/"/g, ''),
            delivery_location: shipment.delivery_location?.replace(/"/g, ''),
            delivery_location_index: null, // Will be set during optimization
            delivery_service: parseInt(shipment.delivery_service) || 0,
            delivery_setup: 0, // No delivery setup in CSV
            delivery_time_start: shipment.delivery_time_start?.replace(/"/g, ''),
            delivery_time_end: shipment.delivery_time_end?.replace(/"/g, ''),
            amount: shipment.amount?.replace(/"/g, ''),
            skills: null,
            priority: 0,
            zones: null,
            load_types: null,
            incompatible_load_types: null,
            max_time_in_vehicle: null,
            revenue: null,
            outsourcing_cost: null,
            follow_lifo_order: 0,
            volume: null,
            joint_order: null
          };
          
          shipments.push(dbShipment);
          importedCount++;
          
          if (importedCount % 50 === 0) {
            console.log(`📈 Processed ${importedCount} shipments...`);
          }
        } catch (error) {
          console.error(`❌ Error processing line ${i}:`, error);
          errorCount++;
        }
      }
    }
    
    console.log(`\n📊 Processing Summary:`);
    console.log(`✅ Successfully processed: ${importedCount} shipments`);
    console.log(`❌ Errors: ${errorCount} shipments`);
    
    // Insert all shipments into database
    console.log('\n💾 Inserting shipments into database...');
    
    // Use batch insert for better performance
    const batchSize = 100;
    let totalInserted = 0;
    
    for (let i = 0; i < shipments.length; i += batchSize) {
      const batch = shipments.slice(i, i + batchSize);
      
      // Build batch insert query
      const fields = Object.keys(batch[0]);
      const placeholders = batch.map(() => `(${fields.map(() => '?').join(', ')})`).join(', ');
      const insertQuery = `INSERT INTO shipments (${fields.join(', ')}) VALUES ${placeholders}`;
      
      // Flatten parameters
      const params = batch.flatMap(shipment => fields.map(field => shipment[field] || null));
      
      try {
        await turso.execute(insertQuery, params);
        totalInserted += batch.length;
        console.log(`📦 Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(shipments.length / batchSize)} (${batch.length} shipments)`);
      } catch (error) {
        console.error(`❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error);
        // Try individual inserts for this batch
        for (const shipment of batch) {
          try {
            const fields = Object.keys(shipment);
            const placeholders = fields.map(() => '?').join(', ');
            const insertQuery = `INSERT INTO shipments (${fields.join(', ')}) VALUES (${placeholders})`;
            const params = fields.map(field => shipment[field] || null);
            await turso.execute(insertQuery, params);
            totalInserted++;
          } catch (individualError) {
            console.error(`❌ Error inserting shipment ${shipment.id}:`, individualError);
          }
        }
      }
    }
    
    // Verify the import
    console.log('\n🔍 Verifying import...');
    const verifyResult = await turso.execute('SELECT COUNT(*) as count FROM shipments');
    const totalInDatabase = verifyResult.rows[0].count;
    
    console.log(`\n🎉 Import completed successfully!`);
    console.log(`📊 Final Summary:`);
    console.log(`   • Total processed from CSV: ${importedCount}`);
    console.log(`   • Total inserted into database: ${totalInserted}`);
    console.log(`   • Total in database: ${totalInDatabase}`);
    console.log(`   • Errors: ${errorCount}`);
    
    if (totalInDatabase === importedCount) {
      console.log(`✅ All shipments successfully imported!`);
    } else {
      console.log(`⚠️  Some shipments may not have been imported correctly`);
    }
    
  } catch (error) {
    console.error('❌ Error during import:', error);
    process.exit(1);
  }
}

// Run the import
importShipmentsFromCSV(); 