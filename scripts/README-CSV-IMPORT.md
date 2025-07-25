# CSV Shipments Import Script

This script (`import-shipments-csv.js`) will delete all existing shipments from the database and import new ones from the CSV file.

## Features

- **Complete Database Reset**: Deletes all existing shipments before importing new ones
- **Direct Database Access**: Works directly with the database for better performance
- **Batch Processing**: Uses batch inserts for faster data insertion
- **Error Handling**: Comprehensive error handling with detailed logging
- **Verification**: Verifies the import by counting records in the database
- **Progress Tracking**: Shows progress during processing and insertion

## Prerequisites

1. Ensure the CSV file `shipments_phoenix_iso.csv` is in the project root directory
2. Make sure you have the required dependencies installed (`@libsql/client`)

## Usage

### Option 1: Using npm script (Recommended)
```bash
npm run import-shipments-csv
```

### Option 2: Direct execution
```bash
node scripts/import-shipments-csv.js
```

## CSV Format

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

## What the Script Does

1. **Database Connection**: Connects to either Turso (if configured) or local SQLite database
2. **Table Creation**: Ensures the shipments table exists with the correct schema
3. **CSV Reading**: Reads and parses the CSV file
4. **Data Deletion**: Deletes all existing shipments from the database
5. **Data Processing**: Transforms CSV data into the database schema format
6. **Batch Insertion**: Inserts shipments in batches of 100 for better performance
7. **Verification**: Counts records in the database to verify the import
8. **Summary**: Provides a detailed summary of the operation

## Data Transformation

The script transforms the CSV data as follows:

- Uses `pickup_id` as the primary key
- Converts datetime strings to Unix timestamps for time windows
- Sets default values for optional fields
- Handles quoted fields and special characters
- Maps CSV columns to database schema fields

## Output Example

```
🚀 Starting shipments import from CSV...
💾 Using local SQLite database
🔧 Ensuring shipments table exists...
📖 Reading CSV file: /path/to/shipments_phoenix_iso.csv
📊 Total lines in CSV: 294
📋 CSV header: [pickup_id, delivery_id, ...]
🗑️  Deleting all existing shipments...
✅ Deleted 0 existing shipments
🔄 Processing CSV data...
📈 Processed 50 shipments...
📈 Processed 100 shipments...
...

📊 Processing Summary:
✅ Successfully processed: 292 shipments
❌ Errors: 0 shipments

💾 Inserting shipments into database...
📦 Inserted batch 1/3 (100 shipments)
📦 Inserted batch 2/3 (100 shipments)
📦 Inserted batch 3/3 (92 shipments)

🔍 Verifying import...

🎉 Import completed successfully!
📊 Final Summary:
   • Total processed from CSV: 292
   • Total inserted into database: 292
   • Total in database: 292
   • Errors: 0
✅ All shipments successfully imported!
```

## Error Handling

The script includes comprehensive error handling:

- **CSV File Not Found**: Checks if the CSV file exists
- **Database Connection Errors**: Handles connection issues gracefully
- **Data Processing Errors**: Continues processing even if individual records fail
- **Batch Insert Errors**: Falls back to individual inserts if batch insertion fails
- **Verification**: Ensures data integrity after import

## Database Schema

The script creates/updates the `shipments` table with the following structure:

```sql
CREATE TABLE shipments (
  id TEXT PRIMARY KEY,
  -- Pickup step fields
  pickup_id TEXT,
  pickup_description TEXT,
  pickup_location_index INTEGER,
  pickup_service INTEGER,
  pickup_setup INTEGER,
  pickup_time_windows TEXT,
  -- Delivery step fields
  delivery_id TEXT,
  delivery_description TEXT,
  delivery_location_index INTEGER,
  delivery_service INTEGER,
  delivery_setup INTEGER,
  delivery_time_windows TEXT,
  -- Shipment level fields
  amount TEXT,
  skills TEXT,
  priority INTEGER,
  zones TEXT,
  load_types TEXT,
  incompatible_load_types TEXT,
  max_time_in_vehicle INTEGER,
  revenue INTEGER,
  outsourcing_cost INTEGER,
  follow_lifo_order INTEGER,
  volume TEXT,
  joint_order INTEGER
)
```

## Troubleshooting

### Common Issues

1. **"CSV file not found"**
   - Ensure `shipments_phoenix_iso.csv` is in the project root directory

2. **"Database connection error"**
   - Check if the database file exists and is accessible
   - Ensure proper permissions for the database file

3. **"Import errors"**
   - Check the CSV format matches the expected structure
   - Verify all required columns are present

4. **"Batch insert errors"**
   - The script will automatically fall back to individual inserts
   - Check the console output for specific error details

### Performance Tips

- The script uses batch inserts for better performance
- For large datasets, consider increasing the batch size in the script
- Ensure sufficient disk space for the database file

## Comparison with API Import

This script differs from the existing `import-shipments.js` in several ways:

| Feature | CSV Import Script | API Import Script |
|---------|------------------|-------------------|
| Database Access | Direct | Via HTTP API |
| Performance | Faster (batch inserts) | Slower (HTTP requests) |
| Dependencies | Requires Next.js server | Standalone |
| Error Handling | More detailed | Basic |
| Verification | Database count | API response |

Choose the CSV import script for:
- Better performance
- More detailed error reporting
- Standalone operation (no server required)
- Complete database reset functionality 