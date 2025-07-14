#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

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

// Ensure jobs table exists
function ensureJobsTable(db) {
  return new Promise((resolve, reject) => {
    db.run(`
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
    `, (err) => {
      if (err) {
        reject(err);
      } else {
        console.log('✅ Jobs table ensured');
        resolve();
      }
    });
  });
}

// Import jobs from CSV
function importJobs(db, csvFilePath) {
  return new Promise((resolve, reject) => {
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
      
      // Clear existing data
      console.log('🗑️  Clearing existing jobs data...');
      db.run('DELETE FROM jobs', (err) => {
        if (err) {
          reject(err);
          return;
        }
        
        let importedCount = 0;
        let errorCount = 0;
        let processedCount = 0;
        
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
            db.run(
              `INSERT INTO jobs (id, description, location, latitude, longitude, service, delivery, skills, time_window_start, time_window_end) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [job.id, job.description, job.location, job.latitude, job.longitude, job.service, job.delivery, job.skills, job.time_window_start, job.time_window_end],
              function(err) {
                processedCount++;
                
                if (err) {
                  console.error(`❌ Error inserting job ${job.id}:`, err.message);
                  errorCount++;
                } else {
                  importedCount++;
                }
                
                if (importedCount % 10 === 0) {
                  console.log(`📈 Imported ${importedCount} jobs...`);
                }
                
                // Check if we've processed all lines
                if (processedCount === lines.length - 1) {
                  console.log(`\n✅ Import completed!`);
                  console.log(`📊 Successfully imported: ${importedCount} jobs`);
                  console.log(`❌ Errors: ${errorCount} records`);
                  
                  // Verify the import
                  db.get('SELECT COUNT(*) as count FROM jobs', (err, row) => {
                    if (err) {
                      reject(err);
                    } else {
                      console.log(`🗄️  Total jobs in database: ${row.count}`);
                      
                      // Show a sample job
                      db.get('SELECT * FROM jobs LIMIT 1', (err, row) => {
                        if (err) {
                          reject(err);
                        } else if (row) {
                          console.log('\n📋 Sample imported job:');
                          console.log(JSON.stringify(row, null, 2));
                        }
                        resolve();
                      });
                    }
                  });
                }
              }
            );
            
          } catch (error) {
            console.error(`❌ Error processing line ${i + 1}:`, error.message);
            errorCount++;
            processedCount++;
            
            if (processedCount === lines.length - 1) {
              resolve();
            }
          }
        }
      });
      
    } catch (error) {
      reject(error);
    }
  });
}

// Main function
async function main() {
  try {
    // Get CSV file path from command line argument or use default
    const csvFilePath = process.argv[2] || 'jobs_tampa.csv';
    
    console.log('🚀 Starting jobs import...');
    console.log(`📁 CSV file: ${csvFilePath}`);
    console.log('---');
    
    // Open database
    const dbPath = path.join(process.cwd(), 'local.db');
    const db = new sqlite3.Database(dbPath);
    
    // Ensure table exists
    await ensureJobsTable(db);
    
    // Import jobs
    await importJobs(db, csvFilePath);
    
    // Close database
    db.close();
    
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