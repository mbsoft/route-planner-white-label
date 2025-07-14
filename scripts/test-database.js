const fs = require('fs');
const path = require('path');

// Test script to verify database functionality
console.log('Testing Database Functionality...\n');

// Check if CSV files exist
const jobsCsvPath = path.join(process.cwd(), 'jobs.csv');
const vehiclesCsvPath = path.join(process.cwd(), 'vehicles.csv');

console.log('Checking CSV files...');
if (fs.existsSync(jobsCsvPath)) {
  const jobsContent = fs.readFileSync(jobsCsvPath, 'utf-8');
  const jobsLines = jobsContent.split('\n').filter(line => line.trim());
  console.log(`✓ jobs.csv found with ${jobsLines.length - 1} records (excluding header)`);
} else {
  console.log('✗ jobs.csv not found');
}

if (fs.existsSync(vehiclesCsvPath)) {
  const vehiclesContent = fs.readFileSync(vehiclesCsvPath, 'utf-8');
  const vehiclesLines = vehiclesContent.split('\n').filter(line => line.trim());
  console.log(`✓ vehicles.csv found with ${vehiclesLines.length - 1} records (excluding header)`);
} else {
  console.log('✗ vehicles.csv not found');
}

// Check environment variables
console.log('\nChecking environment variables...');
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const hasTursoUrl = envContent.includes('TURSO_DATABASE_URL=');
  const hasTursoToken = envContent.includes('TURSO_AUTH_TOKEN=');
  
  console.log(`✓ .env.local found`);
  console.log(`  TURSO_DATABASE_URL: ${hasTursoUrl ? '✓ Set' : '✗ Not set'}`);
  console.log(`  TURSO_AUTH_TOKEN: ${hasTursoToken ? '✓ Set' : '✗ Not set'}`);
} else {
  console.log('✗ .env.local not found - please create it with your Turso credentials');
}

console.log('\nDatabase API Endpoints:');
console.log('  GET /api/optimization-results?type=jobs - Get all jobs from database');
console.log('  GET /api/optimization-results?type=vehicles - Get all vehicles from database');
console.log('  POST /api/optimization-results with action=populate-jobs - Populate jobs from CSV');
console.log('  POST /api/optimization-results with action=populate-vehicles - Populate vehicles from CSV');
console.log('  POST /api/optimization-results with action=populate-all - Populate both from CSV');

console.log('\nTo test the database functionality:');
console.log('1. Set up your Turso database credentials in .env.local');
console.log('2. Start the development server: npm run dev');
console.log('3. Navigate to /database to use the database management interface');
console.log('4. Or test the API endpoints directly'); 