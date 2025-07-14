# CSV Import Scripts

This directory contains Node.js scripts for importing CSV data into the route planner database.

## Scripts

### `import-jobs.js`
Imports job data from a CSV file into the `jobs` table.

### `import-vehicles.js`
Imports vehicle data from a CSV file into the `vehicles` table.

### `import-all.js`
Imports both jobs and vehicles from CSV files in a single operation.

## Prerequisites

1. **Node.js**: Version 18.17.0 or higher
2. **Database**: Either Turso database or local SQLite
3. **Environment Variables**: Set up your database connection

### Environment Variables

For Turso database:
```bash
export TURSO_DATABASE_URL="your_turso_database_url"
export TURSO_AUTH_TOKEN="your_turso_auth_token"
```

For local development (SQLite):
- No environment variables needed (will use local.db)

## Usage

### Import Jobs

```bash
# Import using default file (jobs_tampa.csv)
node scripts/import-jobs.js

# Import using custom CSV file
node scripts/import-jobs.js path/to/your/jobs.csv
```

### Import Vehicles

```bash
# Import using default file (vehicles_tampa.csv)
node scripts/import-vehicles.js

# Import using custom CSV file
node scripts/import-vehicles.js path/to/your/vehicles.csv
```

### Import Both Jobs and Vehicles

```bash
# Import using default files (jobs_tampa.csv, vehicles_tampa.csv)
node scripts/import-all.js

# Import using custom CSV files
node scripts/import-all.js path/to/your/jobs.csv path/to/your/vehicles.csv

# Import only jobs (vehicles file not found)
node scripts/import-all.js path/to/your/jobs.csv

# Import only vehicles (jobs file not found)
node scripts/import-all.js "" path/to/your/vehicles.csv

## CSV File Formats

### Jobs CSV Format

The jobs CSV file should have the following columns:

| Column | Type | Description | Required |
|--------|------|-------------|----------|
| id | string | Unique job identifier | Yes |
| description | string | Job description | No |
| location | string | Location string | No |
| latitude | number | Latitude coordinate | No |
| longitude | number | Longitude coordinate | No |
| service | number | Service time in seconds | No |
| delivery | string | Delivery amounts (JSON array) | No |
| skills | string | Required skills (JSON array) | No |
| time_window_start | string | Start time window | No |
| time_window_end | string | End time window | No |

**Example:**
```csv
id,description,location,latitude,longitude,service,delivery,skills,time_window_start,time_window_end
90081-356,"90081|1405 East 2nd Avenue, Tampa, FL|Gasoline UNL","33.434477,-112.18419",33.434477,-112.18419,300,"[0, 0, 51, 0, 0]",,2025-07-16 04:00:00 EDT,2025-07-16 12:00:00 EDT
```

### Vehicles CSV Format

The vehicles CSV file should have the following columns:

| Column | Type | Description | Required |
|--------|------|-------------|----------|
| id | string | Unique vehicle identifier | Yes |
| description | string | Vehicle description | No |
| start_location | string | Start location string | No |
| start_latitude | number | Start latitude coordinate | No |
| start_longitude | number | Start longitude coordinate | No |
| end_location | string | End location string | No |
| end_latitude | number | End latitude coordinate | No |
| end_longitude | number | End longitude coordinate | No |
| time_window_start | string | Start time window | No |
| time_window_end | string | End time window | No |
| capacity | string | Vehicle capacity (JSON array) | No |
| alternative_capacities | string | Alternative capacity configurations | No |
| skills | string | Required skills (JSON array) | No |
| fixed_cost | number | Fixed cost for vehicle | No |
| max_tasks | number | Maximum number of tasks | No |

**Example:**
```csv
id,description,start_location,start_latitude,start_longitude,end_location,end_latitude,end_longitude,time_window_start,time_window_end,capacity,alternative_capacities,skills,fixed_cost,max_tasks
4305|45|Trailer-Fuel,4305|45 Tampa LFC,"33.434477,-112.18419",33.434477,-112.18419,"33.434477,-112.18419",33.434477,-112.18419,2025-07-16 08:00:00 EDT,2025-07-16 18:00:00 EDT,"[1, 1, 1, 1, 1]","[[4000, 0, 0, 0, 0], [1350, 2650, 0, 0, 0]]",,,
```

## Features

### Data Validation
- Validates required fields (ID)
- Handles missing or invalid data gracefully
- Reports errors without stopping the import

### Progress Tracking
- Shows import progress every 10 jobs / 5 vehicles
- Displays final statistics
- Shows sample imported record

### Database Management
- Automatically creates tables if they don't exist
- Clears existing data before import (configurable)
- Supports both Turso and local SQLite databases

### CSV Parsing
- Handles quoted fields properly
- Supports complex JSON data in fields
- Robust error handling for malformed CSV

## Error Handling

The scripts handle various error scenarios:

- **Missing CSV file**: Clear error message
- **Invalid CSV format**: Skip problematic rows and continue
- **Database connection issues**: Clear error messages
- **Missing required fields**: Skip rows with missing IDs
- **Data type conversion errors**: Use default values

## Output

The scripts provide detailed output including:

- Database connection status
- Number of records found
- Import progress
- Success/error counts
- Final verification
- Sample imported record

## Examples

### Import Tampa Data

```bash
# Import jobs from Tampa CSV
node scripts/import-jobs.js jobs_tampa.csv

# Import vehicles from Tampa CSV  
node scripts/import-vehicles.js vehicles_tampa.csv

# Import both jobs and vehicles from Tampa CSV
node scripts/import-all.js jobs_tampa.csv vehicles_tampa.csv

### Import Custom Data

```bash
# Import your own job data
node scripts/import-jobs.js /path/to/my-jobs.csv

# Import your own vehicle data
node scripts/import-vehicles.js /path/to/my-vehicles.csv

# Import both your custom job and vehicle data
node scripts/import-all.js /path/to/my-jobs.csv /path/to/my-vehicles.csv

## Troubleshooting

### Common Issues

1. **Node.js version**: Ensure you're using Node.js 18.17.0+
2. **Database connection**: Check your environment variables
3. **CSV format**: Ensure your CSV matches the expected format
4. **File permissions**: Make sure the script can read your CSV file

### Debug Mode

To see more detailed output, you can modify the scripts to add more logging:

```javascript
// Add this line for more verbose logging
console.log('Processing values:', values);
```

## Integration

These scripts can be integrated into your workflow:

- **CI/CD pipelines**: Add to deployment scripts
- **Data migration**: Use for bulk data imports
- **Testing**: Import test data for development
- **Backup/restore**: Export/import data between environments 