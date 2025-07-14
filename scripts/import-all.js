#!/usr/bin/env node

// Polyfill for Node.js < 18
if (!global.Request) {
  global.Request = require('node-fetch').Request;
}

const fs = require('fs');
const path = require('path');
const { createClient } = require('@libsql/client');

// Import the individual import functions
const { importJobs, ensureJobsTable } = require('./import-jobs');
const { importVehicles, ensureVehiclesTable } = require('./import-vehicles');

// Database configuration
const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

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

// Import all data (jobs and vehicles)
async function importAll(jobsCsvPath, vehiclesCsvPath) {
  try {
    console.log('🚀 Starting complete data import...');
    console.log('---');
    
    // Ensure tables exist
    await ensureJobsTable();
    await ensureVehiclesTable();
    
    // Import jobs
    if (jobsCsvPath && fs.existsSync(jobsCsvPath)) {
      console.log('\n📋 Importing jobs...');
      await importJobs(jobsCsvPath);
    } else {
      console.log('\n⚠️  Jobs CSV file not found, skipping jobs import');
    }
    
    // Import vehicles
    if (vehiclesCsvPath && fs.existsSync(vehiclesCsvPath)) {
      console.log('\n🚛 Importing vehicles...');
      await importVehicles(vehiclesCsvPath);
    } else {
      console.log('\n⚠️  Vehicles CSV file not found, skipping vehicles import');
    }
    
    // Final summary
    console.log('\n📊 Final Database Summary:');
    console.log('---');
    
    const jobsCount = await turso.execute('SELECT COUNT(*) as count FROM jobs');
    const vehiclesCount = await turso.execute('SELECT COUNT(*) as count FROM vehicles');
    
    console.log(`📋 Jobs in database: ${jobsCount.rows[0].count}`);
    console.log(`🚛 Vehicles in database: ${vehiclesCount.rows[0].count}`);
    
    console.log('\n🎉 Complete data import finished!');
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  }
}

// Main function
async function main() {
  try {
    // Get CSV file paths from command line arguments
    const jobsCsvPath = process.argv[2] || 'jobs_tampa.csv';
    const vehiclesCsvPath = process.argv[3] || 'vehicles_tampa.csv';
    
    console.log('📁 Jobs CSV file:', jobsCsvPath);
    console.log('📁 Vehicles CSV file:', vehiclesCsvPath);
    console.log('---');
    
    await importAll(jobsCsvPath, vehiclesCsvPath);
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { importAll }; 