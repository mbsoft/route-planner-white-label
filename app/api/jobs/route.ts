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

    const result = await turso.execute(query, params);
    
    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json({ jobs: [] });
    }

    const jobs = result.rows.map((row: any) => ({
      id: row.id,
      description: row.description,
      location: row.location || '',
      latitude: row.latitude,
      longitude: row.longitude,
      service: row.service,
      delivery: row.delivery,
      skills: row.skills,
      time_window_start: row.time_window_start,
      time_window_end: row.time_window_end
    }));

    return NextResponse.json({ jobs });

  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
} 