const fs = require('fs');

// NextBillion.ai API configuration
const NEXTBILLION_API_KEY = process.env.NEXTBILLION_API_KEY || 'your-api-key-here';
const GEOCODE_ENDPOINT = 'https://api.nextbillion.io/geocoding/v1/forward';

// Function to extract address from description field
function extractAddress(description) {
  try {
    // Remove quotes and split by '|'
    const cleanDesc = description.replace(/"/g, '');
    const parts = cleanDesc.split('|');
    
    if (parts.length >= 2) {
      return parts[1].trim(); // Second token is the address
    }
    return null;
  } catch (error) {
    console.error('Error extracting address:', error);
    return null;
  }
}

// Function to geocode address using NextBillion.ai
async function geocodeAddress(address) {
  try {
    const url = `${GEOCODE_ENDPOINT}?key=${NEXTBILLION_API_KEY}&q=${encodeURIComponent(address)}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].geometry.coordinates;
      return { lat, lng };
    }
    
    return null;
  } catch (error) {
    console.error(`Error geocoding address "${address}":`, error.message);
    return null;
  }
}

// Function to parse CSV line
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

// Function to write CSV line
function writeCSVLine(fields) {
  return fields.map(field => {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }).join(',');
}

// Main function to process the jobs CSV file
async function geocodeJobsCSV(inputFile = 'jobs.csv', outputFile = 'jobs_geocoded.csv') {
  try {
    console.log(`Reading ${inputFile}...`);
    const csvContent = fs.readFileSync(inputFile, 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      console.error('No data found in CSV file');
      return;
    }
    
    const header = parseCSVLine(lines[0]);
    const dataLines = lines.slice(1);
    
    console.log(`Found ${dataLines.length} job records to process`);
    console.log('Starting geocoding process...\n');
    
    const updatedLines = [header];
    let processed = 0;
    let updated = 0;
    let errors = 0;
    
    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i];
      const fields = parseCSVLine(line);
      
      if (fields.length < 10) {
        console.log(`Skipping line ${i + 2}: insufficient fields`);
        errors++;
        continue;
      }
      
      const description = fields[1]; // description field
      const address = extractAddress(description);
      
      if (!address) {
        console.log(`Line ${i + 2}: Could not extract address from description`);
        errors++;
        updatedLines.push(line);
        continue;
      }
      
      console.log(`Processing line ${i + 2}: ${address}`);
      
      const coordinates = await geocodeAddress(address);
      
      if (coordinates) {
        // Update latitude and longitude fields (indices 3 and 4)
        fields[3] = coordinates.lat.toString();
        fields[4] = coordinates.lng.toString();
        
        // Update location field (index 2) to match the new coordinates
        fields[2] = `"${coordinates.lat}, ${coordinates.lng}"`;
        
        updatedLines.push(writeCSVLine(fields));
        updated++;
        console.log(`  ✓ Updated coordinates: ${coordinates.lat}, ${coordinates.lng}`);
      } else {
        console.log(`  ✗ Failed to geocode address`);
        errors++;
        updatedLines.push(line);
      }
      
      processed++;
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Progress update every 10 records
      if (processed % 10 === 0) {
        console.log(`Progress: ${processed}/${dataLines.length} records processed`);
      }
    }
    
    // Write the updated CSV file
    const outputContent = updatedLines.join('\n');
    fs.writeFileSync(outputFile, outputContent);
    
    console.log('\n=== Geocoding Complete ===');
    console.log(`Total records processed: ${processed}`);
    console.log(`Records updated: ${updated}`);
    console.log(`Errors: ${errors}`);
    console.log(`Output file: ${outputFile}`);
    
  } catch (error) {
    console.error('Error processing CSV file:', error);
  }
}

// Check if API key is provided
if (!NEXTBILLION_API_KEY || NEXTBILLION_API_KEY === 'your-api-key-here') {
  console.error('Error: NEXTBILLION_API_KEY environment variable is required');
  console.error('Please set your NextBillion.ai API key:');
  console.error('export NEXTBILLION_API_KEY="your-actual-api-key"');
  process.exit(1);
}

// Run the geocoding process
geocodeJobsCSV().catch(console.error); 