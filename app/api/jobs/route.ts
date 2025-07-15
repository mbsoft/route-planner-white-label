import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

// Check if Turso environment variables are set
const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

let turso: any;

if (tursoUrl && tursoAuthToken && !tursoUrl.includes('your_turso_database_url_here')) {
  // Use Turso if environment variables are properly set
  turso = createClient({ url: tursoUrl, authToken: tursoAuthToken });
} else {
  // Fallback to local SQLite for development
  console.log('Turso environment variables not set, using local SQLite database');
  turso = createClient({ 
    url: 'file:./local.db',
    syncUrl: undefined,
    authToken: undefined
  });
}

// Convert Unix timestamp to SQLite datetime string
const unixToSqliteDateTime = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return date.toISOString().replace('T', ' ').replace('Z', '');
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startParam = searchParams.get('start');
    const endParam = searchParams.get('end');
    const searchParam = searchParams.get('search');

    // Debug: Check current table schema
    const schemaResult = await turso.execute("PRAGMA table_info(jobs)");
    console.log('Current jobs table schema:', schemaResult.rows);

    let query = 'SELECT * FROM jobs';
    let params: any[] = [];
    let whereConditions: string[] = [];

    // Build time window conditions
    let timeWindowCondition = '';
    if (startParam && endParam) {
      const startTime = unixToSqliteDateTime(parseInt(startParam));
      const endTime = unixToSqliteDateTime(parseInt(endParam));
      
      timeWindowCondition = `
        (time_window_start >= ? AND time_window_start <= ?) OR
        (time_window_end >= ? AND time_window_end <= ?) OR
        (time_window_start <= ? AND time_window_end >= ?) OR
        (time_window_start = '' OR time_window_start IS NULL OR time_window_end = '' OR time_window_end IS NULL)
      `;
      params.push(startTime, endTime, startTime, endTime, startTime, endTime);
    }

    // Build search conditions
    let searchCondition = '';
    if (searchParam && searchParam.trim()) {
      // Simple substring matching - case insensitive
      searchCondition = 'LOWER(description) LIKE ?';
      const searchTerm = searchParam.toLowerCase();
      params.push(`%${searchTerm}%`);
    }

    // Combine conditions
    if (timeWindowCondition && searchCondition) {
      // Both time window and search filters: records must match time window AND search
      whereConditions.push(`(${timeWindowCondition}) AND (${searchCondition})`);
    } else if (timeWindowCondition) {
      // Only time window filter
      whereConditions.push(timeWindowCondition);
    } else if (searchCondition) {
      // Only search filter
      whereConditions.push(searchCondition);
    }
    // If neither, no conditions (returns all records)

    // Build the final query
    if (whereConditions.length > 0) {
      query = `SELECT * FROM jobs WHERE ${whereConditions.join(' AND ')} ORDER BY time_window_start ASC LIMIT 1000`;
    } else {
      query = 'SELECT * FROM jobs ORDER BY time_window_start ASC LIMIT 1000';
    }

    console.log('Executing query:', query);
    console.log('Query parameters:', params);

    const result = await turso.execute(query, params);
    
    console.log('Raw database result:', result.rows);
    
    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json({ jobs: [] });
    }

    const jobs = result.rows.map((row: any) => {
      // Return all columns dynamically
      const job: any = {};
      for (const [key, value] of Object.entries(row)) {
        job[key] = value;
      }
      console.log('Processed job:', job);
      return job;
    });

    console.log('Final jobs array:', jobs);

    return NextResponse.json({ jobs });

  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobs } = body;

    console.log('PUT /api/jobs - Received jobs:', jobs);

    if (!jobs || !Array.isArray(jobs)) {
      return NextResponse.json(
        { error: 'Invalid request body. Expected jobs array.' },
        { status: 400 }
      );
    }

    // Get current table schema to check for existing columns
    const schemaResult = await turso.execute("PRAGMA table_info(jobs)");
    const existingColumns = new Set(schemaResult.rows.map((row: any) => row.name));
    console.log('Existing columns before update:', Array.from(existingColumns));

    // Update each job in the database
    for (const job of jobs) {
      if (!job.id) {
        continue; // Skip jobs without ID
      }

      console.log(`Processing job ${job.id}:`, job);

      // Check for new columns and add them to the schema
      for (const [key, value] of Object.entries(job)) {
        if (key !== 'id' && !existingColumns.has(key)) {
          // Determine column type based on value
          let columnType = 'TEXT';
          if (typeof value === 'number') {
            columnType = value % 1 === 0 ? 'INTEGER' : 'REAL';
          } else if (typeof value === 'boolean') {
            columnType = 'INTEGER';
          }
          
          try {
            await turso.execute(`ALTER TABLE jobs ADD COLUMN ${key} ${columnType}`);
            existingColumns.add(key);
            console.log(`Added new column '${key}' to jobs table`);
          } catch (error) {
            console.error(`Failed to add column '${key}' to jobs table:`, error);
          }
        }
      }

      // Build dynamic UPDATE query with all available columns
      const updateFields = Object.keys(job).filter(key => key !== 'id');
      const setClause = updateFields.map(field => `${field} = ?`).join(', ');
      const updateQuery = `UPDATE jobs SET ${setClause} WHERE id = ?`;

      const params = [
        ...updateFields.map(field => job[field] || null),
        job.id
      ];

      console.log(`Executing update query for job ${job.id}:`, updateQuery);
      console.log(`Update parameters:`, params);

      await turso.execute(updateQuery, params);
      console.log(`Successfully updated job ${job.id}`);
    }

    // Verify the data was saved by checking one job
    if (jobs.length > 0) {
      const verifyJob = jobs[0];
      const verifyResult = await turso.execute('SELECT * FROM jobs WHERE id = ?', [verifyJob.id]);
      console.log('Verification - job after save:', verifyResult.rows[0]);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Updated ${jobs.length} job(s)` 
    });

  } catch (error) {
    console.error('Error updating jobs:', error);
    return NextResponse.json(
      { error: 'Failed to update jobs' },
      { status: 500 }
    );
  }
} 