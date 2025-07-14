const fs = require('fs');
const http = require('http');

// Function to check if coordinates are valid
function isValidLatitude(lat) {
  return lat >= -90 && lat <= 90;
}

function isValidLongitude(lng) {
  return lng >= -180 && lng <= 180;
}

// Function to fix swapped coordinates
function fixCoordinates(lat, lng) {
  // If latitude is outside valid range but longitude is in valid latitude range
  if (!isValidLatitude(lat) && isValidLatitude(lng)) {
    return { latitude: lng, longitude: lat };
  }
  // If longitude is outside valid range but latitude is in valid longitude range
  if (!isValidLongitude(lng) && isValidLongitude(lat)) {
    return { latitude: lng, longitude: lat };
  }
  // If both are invalid, try swapping
  if (!isValidLatitude(lat) && !isValidLongitude(lng)) {
    return { latitude: lng, longitude: lat };
  }
  // If both are valid, return as is
  return { latitude: lat, longitude: lng };
}

// Simple HTTP request function
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

// Read the current jobs data
async function fixDatabaseCoordinates() {
  try {
    const response = await makeRequest('http://localhost:3000/api/optimization-results?type=jobs');
    
    if (response.status !== 200) {
      console.error('Failed to fetch jobs data:', response.status);
      return;
    }
    
    const data = response.data;
    console.log(`Found ${data.jobs.length} jobs in database`);
    
    let fixedCount = 0;
    const fixedJobs = data.jobs.map(job => {
      const originalLat = parseFloat(job.latitude);
      const originalLng = parseFloat(job.longitude);
      
      const fixed = fixCoordinates(originalLat, originalLng);
      
      if (fixed.latitude !== originalLat || fixed.longitude !== originalLng) {
        console.log(`Fixing job ${job.id}:`);
        console.log(`  Original: lat=${originalLat}, lng=${originalLng}`);
        console.log(`  Fixed:    lat=${fixed.latitude}, lng=${fixed.longitude}`);
        fixedCount++;
      }
      
      return {
        ...job,
        latitude: fixed.latitude.toString(),
        longitude: fixed.longitude.toString()
      };
    });
    
    console.log(`\nFixed ${fixedCount} jobs with invalid coordinates`);
    
    if (fixedCount > 0) {
      // Update the database with fixed coordinates
      const updateResponse = await makeRequest('http://localhost:3000/api/optimization-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_jobs',
          jobs: fixedJobs
        })
      });
      
      if (updateResponse.status === 200) {
        console.log('Successfully updated database with fixed coordinates');
      } else {
        console.error('Failed to update database:', updateResponse.status);
      }
    } else {
      console.log('No coordinates needed fixing');
    }
    
  } catch (error) {
    console.error('Error fixing coordinates:', error);
  }
}

// Run the fix
fixDatabaseCoordinates(); 