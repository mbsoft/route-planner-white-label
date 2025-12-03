import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

// Debug flag
const DEBUG_WEBHOOK = true;

// Check if Turso environment variables are set
const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

let turso: any;

if (tursoUrl && tursoAuthToken && !tursoUrl.includes('your_turso_database_url_here')) {
  turso = createClient({ url: tursoUrl, authToken: tursoAuthToken });
} else {
  turso = createClient({ 
    url: 'file:./local.db',
    syncUrl: undefined,
    authToken: undefined
  });
}

// Ensure optimization_status table exists
async function ensureStatusTable() {
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS optimization_status (
      request_id TEXT PRIMARY KEY,
      status TEXT NOT NULL,
      result_data TEXT,
      error_message TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export async function POST(req: NextRequest) {
  try {
    await ensureStatusTable();
    
    const body = await req.json();
    
    if (DEBUG_WEBHOOK) {
      console.log('🔔 Webhook received:', JSON.stringify(body, null, 2));
      console.log('🔔 Webhook headers:', Object.fromEntries(req.headers.entries()));
    }
    
    // NextBillion sends request_id, not id
    const { event, request_id, id, data } = body;
    const requestId = request_id || id; // Support both formats
    
    if (!event || !requestId) {
      if (DEBUG_WEBHOOK) {
        console.log('❌ Webhook missing required fields - event:', event, 'request_id:', requestId);
      }
      return NextResponse.json(
        { error: 'Missing required fields: event and request_id' },
        { status: 400 }
      );
    }
    
    // Handle JOB_COMPLETED event
    if (event === 'JOB_COMPLETED') {
      if (DEBUG_WEBHOOK) {
        console.log('✅ Job completed via webhook:', requestId);
        console.log('✅ Webhook data:', JSON.stringify(data, null, 2));
      }
      
      // Store the result data in the status table
      // Note: The webhook doesn't include the full result data, just the completion notification
      // We'll mark it as completed and the SSE stream will fetch the full result
      try {
        const result = await turso.execute({
          sql: `
            INSERT INTO optimization_status (request_id, status, result_data, updated_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(request_id) DO UPDATE SET
              status = ?,
              result_data = ?,
              updated_at = CURRENT_TIMESTAMP
          `,
          args: [requestId, 'completed', JSON.stringify(data || { webhook_received: true }), 'completed', JSON.stringify(data || { webhook_received: true })]
        });
        
        if (DEBUG_WEBHOOK) {
          console.log('✅ Database updated successfully for request_id:', requestId);
          // Verify the update
          const verify = await turso.execute({
            sql: 'SELECT * FROM optimization_status WHERE request_id = ?',
            args: [requestId]
          });
          console.log('✅ Verification query result:', verify.rows);
        }
        
        return NextResponse.json({ success: true, message: 'Webhook processed successfully' });
      } catch (dbError) {
        console.error('❌ Database error updating webhook status:', dbError);
        throw dbError;
      }
    }
    
    // Handle JOB_FAILED event
    if (event === 'JOB_FAILED') {
      if (DEBUG_WEBHOOK) {
        console.log('❌ Job failed:', requestId);
      }
      
      const errorMessage = data?.error || data?.message || 'Optimization job failed';
      
      // Store the error status
      await turso.execute({
        sql: `
          INSERT INTO optimization_status (request_id, status, error_message, updated_at)
          VALUES (?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(request_id) DO UPDATE SET
            status = ?,
            error_message = ?,
            updated_at = CURRENT_TIMESTAMP
        `,
        args: [requestId, 'failed', errorMessage, 'failed', errorMessage]
      });
      
      return NextResponse.json({ success: true, message: 'Webhook processed successfully' });
    }
    
    // Unknown event type
    if (DEBUG_WEBHOOK) {
      console.log('⚠️ Unknown event type:', event);
    }
    
    return NextResponse.json(
      { error: `Unknown event type: ${event}` },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check optimization status
export async function GET(req: NextRequest) {
  try {
    await ensureStatusTable();
    
    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get('request_id');
    
    if (!requestId) {
      return NextResponse.json(
        { error: 'Missing request_id parameter' },
        { status: 400 }
      );
    }
    
    const result = await turso.execute({
      sql: 'SELECT * FROM optimization_status WHERE request_id = ?',
      args: [requestId]
    });
    
    if (result.rows.length === 0) {
      return NextResponse.json({
        status: 'pending',
        request_id: requestId
      });
    }
    
    const row = result.rows[0];
    const status = {
      request_id: row.request_id as string,
      status: row.status as string,
      result_data: row.result_data ? JSON.parse(row.result_data as string) : null,
      error_message: row.error_message as string | null,
      updated_at: row.updated_at as string
    };
    
    return NextResponse.json(status);
    
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

