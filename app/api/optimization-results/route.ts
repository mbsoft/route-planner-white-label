import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

const tursoUrl = process.env.TURSO_DATABASE_URL!;
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN!;

const turso = createClient({ url: tursoUrl, authToken: tursoAuthToken });

async function ensureTable() {
  // Create table if it doesn't exist
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS optimization_results (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL,
      title TEXT NOT NULL,
      response_data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'completed'
    )
  `);
  
  // Check if title column exists, if not add it
  try {
    await turso.execute('SELECT title FROM optimization_results LIMIT 1');
  } catch (error) {
    // Title column doesn't exist, add it
    await turso.execute('ALTER TABLE optimization_results ADD COLUMN title TEXT DEFAULT "Untitled"');
  }
}

export async function GET(req: NextRequest) {
  await ensureTable();
  
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get('job_id');
  
  if (jobId) {
    // Get specific result by job_id
    const result = await turso.execute(
      'SELECT * FROM optimization_results WHERE job_id = ? ORDER BY created_at DESC LIMIT 1',
      [jobId]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'No optimization result found for this job ID' }, { status: 404 });
    }
    
    const row = result.rows[0];
    try {
      const responseData = JSON.parse(row.response_data as string);
      return NextResponse.json({
        id: row.id,
        job_id: row.job_id,
        response_data: responseData,
        created_at: row.created_at,
        status: row.status
      });
    } catch (error) {
      return NextResponse.json({ error: 'Failed to parse response data' }, { status: 500 });
    }
  } else {
    // Get all results
    const result = await turso.execute(
      'SELECT * FROM optimization_results ORDER BY created_at DESC LIMIT 50'
    );
    
    const results = result.rows.map(row => ({
      id: row.id,
      job_id: row.job_id,
      title: row.title,
      created_at: row.created_at,
      status: row.status
    }));
    
    return NextResponse.json({ results });
  }
}

export async function POST(req: NextRequest) {
  await ensureTable();
  
  try {
    const body = await req.json();
    const { id, job_id, title, response_data, status = 'completed' } = body;
    
    if (!id || !job_id || !title || !response_data) {
      return NextResponse.json(
        { error: 'Missing required fields: id, job_id, title, response_data' },
        { status: 400 }
      );
    }
    
    await turso.execute(
      'INSERT OR REPLACE INTO optimization_results (id, job_id, title, response_data, status) VALUES (?, ?, ?, ?, ?)',
      [id, job_id, title, JSON.stringify(response_data), status]
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Optimization result saved successfully' 
    });
  } catch (error) {
    console.error('Error saving optimization result:', error);
    return NextResponse.json(
      { error: 'Failed to save optimization result' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  await ensureTable();
  
  try {
    const body = await req.json();
    const { id, title } = body;
    
    if (!id || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: id, title' },
        { status: 400 }
      );
    }
    
    await turso.execute(
      'UPDATE optimization_results SET title = ? WHERE id = ?',
      [title, id]
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Optimization result title updated successfully' 
    });
  } catch (error) {
    console.error('Error updating optimization result title:', error);
    return NextResponse.json(
      { error: 'Failed to update optimization result title' },
      { status: 500 }
    );
  }
} 

export async function DELETE(req: NextRequest) {
  await ensureTable();
  
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing required parameter: id' },
        { status: 400 }
      );
    }
    
    const result = await turso.execute(
      'DELETE FROM optimization_results WHERE id = ?',
      [id]
    );
    
    if (result.rowsAffected === 0) {
      return NextResponse.json(
        { error: 'Optimization result not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Optimization result deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting optimization result:', error);
    return NextResponse.json(
      { error: 'Failed to delete optimization result' },
      { status: 500 }
    );
  }
} 