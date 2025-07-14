#!/usr/bin/env node

// Polyfill for Node.js < 18
if (!global.Request) {
  global.Request = require('node-fetch').Request;
}

const fs = require('fs');
const path = require('path');
const { createClient } = require('@libsql/client');

// Database configuration
const tursoUrl = "libsql://database-nextbillion-ai-vercel-icfg-8q0hg5durahw4z8yicsumesi.aws-us-east-1.turso.io";
const tursoAuthToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NTIxODkyMzQsImlkIjoiMjgzOWIwNmQtM2E2Yy00ZmI3LWIzODItOWUzZWVkNzcyYTE4IiwicmlkIjoiMGViNzQ4YzgtOGRlOS00OWY2LWI4NTYtM2FmYTEwMDJhOTYzIn0.Zufeq7xw4edGSGBfaLudbP-jd7LaI3Og98Bepv-b_keaRCVn34bL6P4-5K5TQNYSOwzUqeDbJ0VBhmwN99y6Bg";

console.log(tursoUrl);
let turso;

if (tursoUrl && tursoAuthToken && !tursoUrl.includes('your_turso_database_url_here')) {
  // Use Turso if environment variables are properly set
  turso = createClient({ url: tursoUrl, authToken: tursoAuthToken });
  console.log('✅ Using Turso database');
} else {
  // Fallback to local SQLite for development
  console.log('⚠️  Turso environment variables not set, using local SQLite database');
  turso = createClient({ 
    url: 'file:./local.db',
    syncUrl: undefined,
    authToken: undefined
  });
}

// CSV parsing function to handle quoted fields
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

// Convert Unix timestamp to SQLite datetime string
function unixToSqliteDateTime(timestamp) {
  if (!timestamp) return null;
  const date = new Date(timestamp * 1000);
  return date.toISOString().replace('T', ' ').replace('Z', '');
}

// Ensure jobs table exists
async function ensureJobsTable() {
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      description TEXT,
      location TEXT,
      latitude REAL,
      longitude REAL,
      service INTEGER,
      delivery TEXT,
      skills TEXT,
      time_window_start TEXT,
      time_window_end TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ Jobs table ensured');
}

// Import jobs from CSV
async function importJobs(csvFilePath) {
  try {
    console.log(`📁 Reading CSV file: ${csvFilePath}`);
    
    if (!fs.existsSync(csvFilePath)) {
      throw new Error(`CSV file not found: ${csvFilePath}`);
    }
    
    const csvContent = fs.readFileSync(csvFilePath, 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header and one data row');
    }
    
    console.log(`📊 Found ${lines.length - 1} job records to import`);
    
    // Clear existing data (optional - comment out if you want to append)
    //console.log('🗑️  Clearing existing jobs data...');
    //await turso.execute('DELETE FROM jobs');
    
    let importedCount = 0;
    let errorCount = 0;
    
    // Process each line (skip header)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      try {
        const values = parseCSVLine(line);
        
        if (values.length < 10) {
          console.warn(`⚠️  Line ${i + 1}: Insufficient columns (${values.length}), skipping`);
          errorCount++;
          continue;
        }
        
        // Parse the job data
        const job = {
          id: values[0]?.replace(/"/g, '') || '',
          description: values[1]?.replace(/"/g, '') || '',
          location: values[2]?.replace(/"/g, '') || '',
          latitude: parseFloat(values[3]) || 0,
          longitude: parseFloat(values[4]) || 0,
          service: Math.abs(parseInt(values[5]) || 0), // Make service positive
          delivery: values[6]?.replace(/"/g, '') || '[]',
          skills: values[7]?.replace(/"/g, '') || '[]',
          time_window_start: values[8]?.replace(/"/g, '') || null,
          time_window_end: values[9]?.replace(/"/g, '') || null
        };
        
        // Validate required fields
        if (!job.id) {
          console.warn(`⚠️  Line ${i + 1}: Missing job ID, skipping`);
          errorCount++;
          continue;
        }
        
        // Insert the job
        await turso.execute(
          `INSERT INTO jobs (id, description, location, latitude, longitude, service, delivery, skills, time_window_start, time_window_end) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [job.id, job.description, job.location, job.latitude, job.longitude, job.service, job.delivery, job.skills, job.time_window_start, job.time_window_end]
        );
        
        importedCount++;
        
        if (importedCount % 10 === 0) {
          console.log(`📈 Imported ${importedCount} jobs...`);
        }
        
      } catch (error) {
        console.error(`❌ Error processing line ${i + 1}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\n✅ Import completed!`);
    console.log(`📊 Successfully imported: ${importedCount} jobs`);
    console.log(`❌ Errors: ${errorCount} records`);
    
    // Verify the import
    const result = await turso.execute('SELECT COUNT(*) as count FROM jobs');
    console.log(`🗄️  Total jobs in database: ${result.rows[0].count}`);
    
    // Show a sample job
    const sampleResult = await turso.execute('SELECT * FROM jobs LIMIT 1');
    if (sampleResult.rows.length > 0) {
      console.log('\n📋 Sample imported job:');
      console.log(JSON.stringify(sampleResult.rows[0], null, 2));
    }
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  }
}

// Main function
async function main() {
  try {
    // Get CSV file path from command line argument or use default
    const csvFilePath = process.argv[2] || 'jobs_tampa.csv';
    
    console.log('🚀 Starting jobs import...');
    console.log(`📁 CSV file: ${csvFilePath}`);
    console.log('---');
    
    // Ensure table exists
    await ensureJobsTable();
    
    // Import jobs
    await importJobs(csvFilePath);
    
    console.log('\n🎉 Jobs import completed successfully!');
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { importJobs, ensureJobsTable }; 