const fs = require('fs');

// Read the JSON file
const jsonData = JSON.parse(fs.readFileSync('/Users/jameswelch/Downloads/ea0becd48d179e8c94b5c9c412a428f5-input.json', 'utf8'));

// Helper function to convert timestamp to readable date
function timestampToDate(timestamp) {
  return new Date(timestamp * 1000).toISOString().replace('T', ' ').substring(0, 19);
}

// Helper function to convert location index to coordinates
function getLocationCoordinates(locationIndex) {
  const location = jsonData.locations.location[locationIndex];
  if (location) {
    const [lat, lng] = location.split(',').map(coord => parseFloat(coord.trim()));
    return `${lat}, ${lng}`;
  }
  return '';
}

// Convert jobs to CSV
function convertJobsToCSV() {
  const jobs = jsonData.jobs;
  const csvRows = [];
  
  // Header
  csvRows.push([
    'id',
    'description', 
    'location',
    'latitude',
    'longitude',
    'service',
    'delivery',
    'skills',
    'time_window_start',
    'time_window_end'
  ].join(','));
  
  // Data rows
  jobs.forEach(job => {
    const location = getLocationCoordinates(job.location_index);
    const [lat, lng] = location ? location.split(',').map(coord => coord.trim()) : ['', ''];
    
    csvRows.push([
      job.id,
      `"${job.description}"`,
      `"${location}"`,
      lat,
      lng,
      job.service,
      job.delivery ? job.delivery.join(';') : '',
      job.skills ? `"${job.skills.join(', ')}"` : '""',
      job.time_windows && job.time_windows[0] ? timestampToDate(job.time_windows[0][0]) : '',
      job.time_windows && job.time_windows[0] ? timestampToDate(job.time_windows[0][1]) : ''
    ].join(','));
  });
  
  return csvRows.join('\n');
}

// Convert vehicles to CSV
function convertVehiclesToCSV() {
  const vehicles = jsonData.vehicles;
  const csvRows = [];
  
  // Header
  csvRows.push([
    'id',
    'description',
    'start_location',
    'start_latitude',
    'start_longitude',
    'end_location', 
    'end_latitude',
    'end_longitude',
    'time_window_start',
    'time_window_end',
    'capacity',
    'skills',
    'fixed_cost',
    'max_tasks'
  ].join(','));
  
  // Data rows
  vehicles.forEach(vehicle => {
    const startLocation = getLocationCoordinates(vehicle.start_index);
    const endLocation = getLocationCoordinates(vehicle.end_index);
    const [startLat, startLng] = startLocation ? startLocation.split(',').map(coord => coord.trim()) : ['', ''];
    const [endLat, endLng] = endLocation ? endLocation.split(',').map(coord => coord.trim()) : ['', ''];
    
    csvRows.push([
      vehicle.id,
      `"${vehicle.description}"`,
      `"${startLocation}"`,
      startLat,
      startLng,
      `"${endLocation}"`,
      endLat,
      endLng,
      vehicle.time_window && vehicle.time_window[0] ? timestampToDate(vehicle.time_window[0]) : '',
      vehicle.time_window && vehicle.time_window[1] ? timestampToDate(vehicle.time_window[1]) : '',
      vehicle.capacity ? vehicle.capacity.join(';') : '',
      vehicle.skills ? `"${vehicle.skills.join(', ')}"` : '""',
      vehicle.costs && vehicle.costs.fixed ? vehicle.costs.fixed : '',
      vehicle.max_tasks || ''
    ].join(','));
  });
  
  return csvRows.join('\n');
}

// Generate the CSV files
const jobsCSV = convertJobsToCSV();
const vehiclesCSV = convertVehiclesToCSV();

// Write to files
fs.writeFileSync('jobs.csv', jobsCSV);
fs.writeFileSync('vehicles.csv', vehiclesCSV);

console.log('CSV files created successfully!');
console.log('jobs.csv - contains', jsonData.jobs.length, 'jobs');
console.log('vehicles.csv - contains', jsonData.vehicles.length, 'vehicles'); 