const fs = require('fs');
const path = require('path');

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

async function debugVehiclesImport() {
  try {
    console.log('Debugging vehicles import...');
    
    // Step 1: Read the CSV file
    const csvPath = path.join(process.cwd(), 'vehicles.csv');
    console.log('CSV path:', csvPath);
    
    if (!fs.existsSync(csvPath)) {
      console.error('❌ vehicles.csv file not found');
      return;
    }
    
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n');
    
    console.log('Total lines in CSV:', lines.length);
    console.log('Header line:', lines[0]);
    
    // Step 2: Parse a few sample lines
    console.log('\nParsing sample lines:');
    for (let i = 1; i < Math.min(4, lines.length); i++) {
      if (lines[i].trim()) {
        const values = parseCSVLine(lines[i]);
        console.log(`Line ${i}: ${values.length} fields`);
        console.log('  ID:', values[0]);
        console.log('  Description:', values[1]);
        console.log('  Start Location:', values[2]);
        console.log('  Start Lat:', values[3]);
        console.log('  Start Lng:', values[4]);
        console.log('  End Location:', values[5]);
        console.log('  End Lat:', values[6]);
        console.log('  End Lng:', values[7]);
        console.log('  Time Window Start:', values[8]);
        console.log('  Time Window End:', values[9]);
        console.log('  Capacity:', values[10]);
        console.log('  Alternative Capacities:', values[11]);
        console.log('  Skills:', values[12]);
        console.log('  Fixed Cost:', values[13]);
        console.log('  Max Tasks:', values[14]);
        console.log('');
      }
    }
    
    // Step 3: Test the import via API
    console.log('Testing import via API...');
    const http = require('http');
    
    function makeRequest(url, options = {}) {
      return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const req = http.request({
          hostname: urlObj.hostname,
          port: urlObj.port || 80,
          path: urlObj.pathname + urlObj.search,
          method: options.method || 'GET',
          headers: options.headers || {}
        }, (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            try {
              const jsonData = JSON.parse(data);
              resolve({ status: res.statusCode, data: jsonData });
            } catch (error) {
              resolve({ status: res.statusCode, data: data });
            }
          });
        });
        
        req.on('error', (error) => {
          reject(error);
        });
        
        if (options.body) {
          req.write(options.body);
        }
        
        req.end();
      });
    }
    
    // Test the import
    const importResponse = await makeRequest('http://localhost:3000/api/optimization-results', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'populate-vehicles'
      })
    });
    
    console.log('Import response:', importResponse.status, importResponse.data);
    
    // Test retrieving vehicles
    const vehiclesResponse = await makeRequest('http://localhost:3000/api/optimization-results?type=vehicles');
    console.log('Vehicles response:', vehiclesResponse.status, vehiclesResponse.data);
    
    if (vehiclesResponse.data.vehicles && vehiclesResponse.data.vehicles.length > 0) {
      console.log('✅ Vehicles imported successfully!');
      console.log('Sample vehicle:', vehiclesResponse.data.vehicles[0]);
    } else {
      console.log('❌ No vehicles found in database');
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

// Run the debug
debugVehiclesImport(); 