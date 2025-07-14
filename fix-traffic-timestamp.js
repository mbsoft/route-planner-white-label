const fs = require('fs');

// Read the JSON file
const inputFile = 'ea0becd48d179e8c94b5c9c412a428f5-input.json';
const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

// 7 days in seconds
const SEVEN_DAYS = 7 * 24 * 60 * 60;

console.log('Current traffic timestamp:', data.options.routing.traffic_timestamp);

// The traffic timestamp should be around the same time as the job/vehicle timestamps
// Let's set it to a reasonable value based on the job timestamps
const jobTimestamps = data.jobs.flatMap(job => job.time_windows.flat());
const avgJobTimestamp = jobTimestamps.reduce((sum, ts) => sum + ts, 0) / jobTimestamps.length;

// Set traffic timestamp to average job timestamp
data.options.routing.traffic_timestamp = Math.floor(avgJobTimestamp);

console.log('Updated traffic timestamp:', data.options.routing.traffic_timestamp);

// Write the updated data back to the file
fs.writeFileSync(inputFile, JSON.stringify(data, null, 2));

console.log('Traffic timestamp fixed!'); 