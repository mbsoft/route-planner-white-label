# Job Address Geocoding Script

This script corrects the geocoded fields in a jobs CSV file by extracting addresses from the description field and using the NextBillion.ai geocoding API to get accurate coordinates.

## Features

- Extracts addresses from the description field using '|' as delimiter
- Uses NextBillion.ai geocoding API for accurate coordinates
- Updates latitude, longitude, and location fields
- Handles CSV parsing with proper quote escaping
- Includes progress tracking and error handling
- Rate limiting to avoid API throttling

## Prerequisites

1. **NextBillion.ai API Key**: You need a valid API key from NextBillion.ai
2. **Node.js**: Version 16 or higher (for fetch API support)

## Setup

1. **Get your NextBillion.ai API key**:
   - Sign up at [NextBillion.ai](https://nextbillion.ai/)
   - Generate an API key from your dashboard

2. **Set the API key as an environment variable**:
   ```bash
   export NEXTBILLION_API_KEY="your-actual-api-key"
   ```

## Usage

### Basic Usage
```bash
node geocode-jobs.js
```

This will:
- Read from `jobs.csv` (default input file)
- Process all job records
- Output to `jobs_geocoded.csv` (default output file)

### Custom File Names
You can modify the script to use different input/output files by changing the parameters in the `geocodeJobsCSV()` function call.

## Input File Format

The script expects a CSV file with the following structure:
```csv
id,description,location,latitude,longitude,service,delivery,skills,time_window_start,time_window_end
61117-2,"61117|1549 South 59th Avenue , Phoenix, AZ|ULSD Clear","33.434477, -112.18419",33.434477,-112.18419,1200,"[239,0]","",2025-07-16 12:00:00,2025-07-17 12:00:00
```

### Description Field Format
The description field should contain three parts separated by '|':
- Part 1: Job ID
- **Part 2: Address** (this is what gets geocoded)
- Part 3: Fuel type

Example: `"61117|1549 South 59th Avenue , Phoenix, AZ|ULSD Clear"`

## Output

The script will:
1. Extract the address from the description field
2. Geocode it using NextBillion.ai API
3. Update the following fields:
   - `location`: Updated with new coordinates
   - `latitude`: Updated with new latitude
   - `longitude`: Updated with new longitude

## Error Handling

The script handles various error scenarios:
- Missing or invalid API key
- Network errors during geocoding
- Invalid address formats
- CSV parsing errors
- Rate limiting

## Rate Limiting

The script includes a 100ms delay between API calls to avoid rate limiting. You can adjust this by modifying the `setTimeout` value in the script.

## Example Output

```
Reading jobs.csv...
Found 292 job records to process
Starting geocoding process...

Processing line 2: 1549 South 59th Avenue , Phoenix, AZ
  ✓ Updated coordinates: 33.434477, -112.18419
Processing line 3: 515 North 51st Avenue, Phoenix, AZ
  ✓ Updated coordinates: 33.454461, -112.167345
...

=== Geocoding Complete ===
Total records processed: 292
Records updated: 290
Errors: 2
Output file: jobs_geocoded.csv
```

## Troubleshooting

### Common Issues

1. **"NEXTBILLION_API_KEY environment variable is required"**
   - Make sure you've set the environment variable correctly
   - Check that the API key is valid

2. **"Error geocoding address"**
   - The address might be invalid or not found
   - Check the address format in your description field

3. **Rate limiting errors**
   - Increase the delay between API calls
   - Check your NextBillion.ai API usage limits

### Debug Mode

To see more detailed error information, you can modify the script to log additional details about failed geocoding attempts.

## API Usage

This script uses the NextBillion.ai Forward Geocoding API:
- Endpoint: `https://api.nextbillion.io/geocoding/v1/forward`
- Method: GET
- Parameters: `key` (API key), `q` (query address)

## Cost Considerations

- NextBillion.ai charges per geocoding request
- The script processes one address per API call
- Consider the cost implications for large datasets

## Alternative Approaches

If you need to process a large number of addresses, consider:
1. Batch geocoding (if supported by the API)
2. Caching results to avoid re-geocoding the same addresses
3. Using a different geocoding service 