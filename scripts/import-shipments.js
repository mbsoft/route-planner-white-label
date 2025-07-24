const fs = require('fs');
const path = require('path');
const http = require('http');

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

// Function to convert datetime string to Unix timestamp
function datetimeToUnix(datetimeStr) {
  if (!datetimeStr) return null;
  return Math.floor(new Date(datetimeStr).getTime() / 1000);
}

// Helper function to make HTTP requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve({ status: res.statusCode, data: result });
        } catch (error) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function importShipments() {
  try {
    console.log('Starting shipments import via API...');
    
    // Read CSV file
    const csvPath = path.join(process.cwd(), 'shipments_phoenix.csv');
    console.log('Reading CSV file:', csvPath);
    
    if (!fs.existsSync(csvPath)) {
      console.error('❌ CSV file not found');
      return;
    }
    
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n');
    console.log('Total lines in CSV:', lines.length);
    
    // Parse header
    const header = parseCSVLine(lines[0]);
    console.log('CSV header:', header);
    
    let importedCount = 0;
    let errorCount = 0;
    
    // Process each line (skip header)
    const shipments = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        try {
          const values = parseCSVLine(line);
          console.log(`Processing line ${i}: ${values.length} fields`);
          
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
            pickup_location_index: null, // Will be set during optimization
            pickup_service: 0, // Default service time
            pickup_setup: parseInt(shipment.pickup_setup) || 0,
            pickup_time_windows: null, // No pickup time windows in CSV
            delivery_id: shipment.delivery_id?.replace(/"/g, ''),
            delivery_description: shipment.delivery_description?.replace(/"/g, ''),
            delivery_location_index: null, // Will be set during optimization
            delivery_service: parseInt(shipment.delivery_service) || 0,
            delivery_setup: 0, // No delivery setup in CSV
            delivery_time_windows: JSON.stringify([
              datetimeToUnix(shipment.delivery_time_start),
              datetimeToUnix(shipment.delivery_time_end)
            ]),
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
          console.log(`✅ Processed shipment ${dbShipment.id}`);
        } catch (error) {
          console.error(`Error processing line ${i}:`, error);
          errorCount++;
        }
      }
    }
    
    console.log(`\n📊 Processing Summary:`);
    console.log(`✅ Successfully processed: ${shipments.length} shipments`);
    console.log(`❌ Errors: ${errorCount} shipments`);
    
    // Import to database via API
    console.log('\nImporting shipments to database via API...');
    
    try {
      const putOptions = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/shipments',
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      };
      
      const putResult = await makeRequest(putOptions, { shipments });
      console.log('✅ API Response:', putResult.data);
      
      // Verify the import by fetching the data
      console.log('\nVerifying import...');
      const getOptions = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/shipments',
        method: 'GET',
      };
      
      const getResult = await makeRequest(getOptions);
      if (getResult.status === 200) {
        console.log(`📈 Total shipments in database: ${getResult.data.shipments?.length || 0}`);
      }
      
    } catch (apiError) {
      console.error('❌ API Error:', apiError);
      console.log('\n💡 Make sure the Next.js development server is running (npm run dev)');
    }
    
    console.log('✅ Import completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during import:', error);
  }
}

importShipments(); 