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

    let query = 'SELECT * FROM jobs';
    let params: any[] = [];

    // If start and end parameters are provided, filter by time window
    if (startParam && endParam) {
      const startTime = unixToSqliteDateTime(parseInt(startParam));
      const endTime = unixToSqliteDateTime(parseInt(endParam));
      
      query = `
        SELECT * FROM jobs 
        WHERE (
          (time_window_start >= ? AND time_window_start <= ?) OR
          (time_window_end >= ? AND time_window_end <= ?) OR
          (time_window_start <= ? AND time_window_end >= ?) OR
          (time_window_start = '' OR time_window_start IS NULL OR time_window_end = '' OR time_window_end IS NULL)
        )
        ORDER BY time_window_start ASC
        LIMIT 1000
      `;
      params = [startTime, endTime, startTime, endTime, startTime, endTime];
    } else {
      // If no time parameters, return all jobs
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