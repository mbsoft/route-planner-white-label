const { createClient } = require('@libsql/client');

async function verifyShipments() {
  try {
    console.log('🔍 Verifying shipments in database...');
    
    // Initialize database client
    const tursoUrl = process.env.TURSO_DATABASE_URL;
    const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;
    
    let turso;
    
    if (tursoUrl && tursoAuthToken && !tursoUrl.includes('your_turso_database_url_here')) {
      turso = createClient({ url: tursoUrl, authToken: tursoAuthToken });
      console.log('📡 Using Turso database');
    } else {
      turso = createClient({ 
        url: 'file:./local.db',
        syncUrl: undefined,
        authToken: undefined
      });
      console.log('💾 Using local SQLite database');
    }
    
    // Check if shipments table exists
    const tableCheck = await turso.execute(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='shipments'
    `);
    
    if (tableCheck.rows.length === 0) {
      console.log('❌ Shipments table does not exist');
      return;
    }
    
    // Get total count
    const countResult = await turso.execute('SELECT COUNT(*) as count FROM shipments');
    const totalShipments = countResult.rows[0].count;
    
    console.log(`📊 Total shipments in database: ${totalShipments}`);
    
    if (totalShipments === 0) {
      console.log('⚠️  No shipments found in database');
      return;
    }
    
    // Get sample records
    const sampleResult = await turso.execute(`
      SELECT id, pickup_description, delivery_description, delivery_time_start, delivery_time_end 
      FROM shipments 
      LIMIT 5
    `);
    
    console.log('\n📋 Sample shipments:');
    sampleResult.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ID: ${row.id}`);
      console.log(`     Pickup: ${row.pickup_description}`);
      console.log(`     Delivery: ${row.delivery_description}`);
      console.log(`     Time Window: ${row.delivery_time_start} to ${row.delivery_time_end}`);
      console.log('');
    });
    
    // Get some statistics
    const statsResult = await turso.execute(`
      SELECT 
        COUNT(DISTINCT pickup_description) as unique_pickups,
        COUNT(DISTINCT delivery_description) as unique_deliveries,
        MIN(delivery_time_start) as earliest_delivery,
        MAX(delivery_time_end) as latest_delivery
      FROM shipments
    `);
    
    const stats = statsResult.rows[0];
    console.log('📈 Database Statistics:');
    console.log(`   • Unique pickup locations: ${stats.unique_pickups}`);
    console.log(`   • Unique delivery locations: ${stats.unique_deliveries}`);
    console.log(`   • Earliest delivery: ${stats.earliest_delivery}`);
    console.log(`   • Latest delivery: ${stats.latest_delivery}`);
    
    console.log('\n✅ Verification completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during verification:', error);
    process.exit(1);
  }
}

// Run the verification
verifyShipments(); 