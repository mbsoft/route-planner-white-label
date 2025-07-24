# Import Scripts

This directory contains scripts for importing data into the route planner application.

## Shipments Import Script

The `import-shipments.js` script imports shipment data from a CSV file into the database via the API.

### Prerequisites

1. Make sure the Next.js development server is running:
   ```bash
   npm run dev
   ```

2. Ensure the CSV file `shipments_phoenix.csv` is in the project root directory.

### Usage

Run the import script:

```bash
npm run import-shipments
```

### CSV Format

The script expects a CSV file with the following columns:

- `pickup_id` - Unique identifier for the pickup location
- `delivery_id` - Unique identifier for the delivery location
- `pickup_description` - Description of the pickup location
- `delivery_description` - Description of the delivery location
- `pickup_location` - Coordinates of the pickup location (lat,lon)
- `delivery_location` - Coordinates of the delivery location (lat,lon)
- `pickup_setup` - Setup time for pickup (seconds)
- `delivery_service` - Service time for delivery (seconds)
- `amount` - Amount array in format [amount1, amount2, amount3, amount4, amount5]
- `delivery_time_start` - Start time for delivery window (YYYY-MM-DD HH:MM:SS)
- `delivery_time_end` - End time for delivery window (YYYY-MM-DD HH:MM:SS)

### Data Transformation

The script transforms the CSV data into the database schema:

- Uses `pickup_id` as the primary key
- Converts datetime strings to Unix timestamps for time windows
- Sets default values for optional fields
- Handles quoted fields and special characters

### Output

The script provides detailed logging:

- Processing progress for each shipment
- Summary of successful imports and errors
- Verification of data in the database
- Total count of imported shipments

### Example Output

```
Starting shipments import via API...
Reading CSV file: /path/to/shipments_phoenix.csv
Total lines in CSV: 294
CSV header: [pickup_id, delivery_id, ...]
✅ Processed shipment 61117-2L
✅ Processed shipment 62483-3L
...

📊 Processing Summary:
✅ Successfully processed: 292 shipments
❌ Errors: 0 shipments

Importing shipments to database via API...
✅ API Response: { success: true, message: 'Updated 292 shipment(s)' }

Verifying import...
📈 Total shipments in database: 292
✅ Import completed successfully!
```

### Troubleshooting

1. **"CSV file not found"** - Ensure `shipments_phoenix.csv` is in the project root
2. **"API Error"** - Make sure the Next.js development server is running on port 3000
3. **"fetch is not defined"** - The script uses Node.js built-in http module, no additional dependencies needed

### Database Schema

The script creates/updates the `shipments` table with the following structure:

- `id` (TEXT PRIMARY KEY) - Shipment identifier
- `pickup_id` (TEXT) - Pickup location ID
- `pickup_description` (TEXT) - Pickup location description
- `pickup_location_index` (INTEGER) - Location index (set during optimization)
- `pickup_service` (INTEGER) - Pickup service time
- `pickup_setup` (INTEGER) - Pickup setup time
- `pickup_time_windows` (TEXT) - Pickup time windows (JSON)
- `delivery_id` (TEXT) - Delivery location ID
- `delivery_description` (TEXT) - Delivery location description
- `delivery_location_index` (INTEGER) - Location index (set during optimization)
- `delivery_service` (INTEGER) - Delivery service time
- `delivery_setup` (INTEGER) - Delivery setup time
- `delivery_time_windows` (TEXT) - Delivery time windows (JSON)
- `amount` (TEXT) - Amount array
- Additional optional fields for advanced features 