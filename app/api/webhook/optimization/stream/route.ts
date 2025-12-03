import { NextRequest } from 'next/server';
import { createClient } from '@libsql/client';

// Debug flag
const DEBUG_SSE = true;

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

export async function GET(req: NextRequest) {
  try {
    await ensureStatusTable();
    
    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get('request_id');
    const region = searchParams.get('region'); // Optional region parameter
    
    if (!requestId) {
      return new Response('Missing request_id parameter', { status: 400 });
    }
    
    if (DEBUG_SSE) {
      console.log('📡 SSE: Connection opened for request_id:', requestId, 'region:', region);
    }
    
    // Create a readable stream for SSE
    const stream = new ReadableStream({
      async start(controller) {
      const encoder = new TextEncoder();
      let lastStatus: string | null = null;
      let lastUpdatedAt: string | null = null;
      
      // Send initial connection message
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected', request_id: requestId })}\n\n`));
      
      let checkCount = 0;
      const maxChecks = 600; // 10 minutes max
      
      // Check status every second
      const interval = setInterval(async () => {
        try {
          checkCount++;
          
          // First check database for webhook status
          const result = await turso.execute({
            sql: 'SELECT * FROM optimization_status WHERE request_id = ?',
            args: [requestId]
          });
          
          let dbStatus: string | null = null;
          if (result.rows.length > 0) {
            const row = result.rows[0];
            dbStatus = row.status as string;
            const currentUpdatedAt = row.updated_at as string;
            
            // Only send update if status or timestamp changed
            if (dbStatus !== lastStatus || currentUpdatedAt !== lastUpdatedAt) {
              lastStatus = dbStatus;
              lastUpdatedAt = currentUpdatedAt;
              
              let resultData = null;
              try {
                if (row.result_data) {
                  resultData = JSON.parse(row.result_data as string);
                }
              } catch (parseError) {
                console.error('Error parsing result_data:', parseError);
                // Continue with null result_data
              }
              
              const status = {
                request_id: row.request_id as string,
                status: dbStatus,
                result_data: resultData,
                error_message: row.error_message as string | null,
                updated_at: currentUpdatedAt
              };
              
              if (DEBUG_SSE) {
                console.log('📡 SSE: Sending status update from database:', status);
              }
              
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'status', ...status })}\n\n`));
              
              // Close connection if job is completed or failed
              if (dbStatus === 'completed' || dbStatus === 'failed') {
                if (DEBUG_SSE) {
                  console.log('📡 SSE: Closing connection - job finished');
                }
                clearInterval(interval);
                controller.close();
                return;
              }
            }
          }
          
          // Always check NextBillion API as fallback if status is pending or not found
          // This handles cases where webhook wasn't called (e.g., localhost URL)
          // Check API every 3 seconds (more frequent than before)
          if ((!dbStatus || dbStatus === 'pending') && checkCount % 3 === 0) {
            try {
              const apiKey = process.env.NEXTBILLION_API_KEY;
              
              if (DEBUG_SSE && checkCount % 15 === 0) {
                console.log('📡 SSE: API key check - exists:', !!apiKey, 'length:', apiKey?.length || 0);
              }
              
              if (!apiKey) {
                if (DEBUG_SSE && checkCount % 30 === 0) {
                  console.log('📡 SSE: No API key found in environment variables');
                }
              } else {
                const regionParam = region === 'americas' ? '&region=america' : '';
                // Use API key as query parameter (same as ApiClient)
                const apiUrl = `https://api.nextbillion.io/optimization/v2/result?id=${requestId}${regionParam}&key=${apiKey}`;
                
                if (DEBUG_SSE && checkCount % 15 === 0) {
                  console.log('📡 SSE: Checking API for request_id:', requestId);
                  console.log('📡 SSE: API URL (without key):', `https://api.nextbillion.io/optimization/v2/result?id=${requestId}${regionParam}&key=...`);
                }
                
                const apiResponse = await fetch(apiUrl, {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                });
                
                if (apiResponse.ok) {
                  const apiData = await apiResponse.json();
                  
                  if (DEBUG_SSE && checkCount % 15 === 0) {
                    console.log('📡 SSE: API response for', requestId, 'message:', apiData.message, 'has result:', !!apiData.result);
                  }
                  
                  // Check if optimization is complete (empty message means completed)
                  if (apiData.message === "" || apiData.message === undefined) {
                    if (DEBUG_SSE) {
                      console.log('📡 SSE: Job completed (detected via API fallback):', requestId);
                      console.log('📡 SSE: API data has routes:', apiData?.result?.routes?.length || 0);
                    }
                    
                    // Update database with completion status
                    await turso.execute({
                      sql: `
                        INSERT INTO optimization_status (request_id, status, result_data, updated_at)
                        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
                        ON CONFLICT(request_id) DO UPDATE SET
                          status = ?,
                          result_data = ?,
                          updated_at = CURRENT_TIMESTAMP
                      `,
                      args: [requestId, 'completed', JSON.stringify(apiData || {}), 'completed', JSON.stringify(apiData || {})]
                    });
                    
                    // Send completion status
                    const status = {
                      request_id: requestId,
                      status: 'completed',
                      result_data: apiData,
                      updated_at: new Date().toISOString()
                    };
                    
                    if (DEBUG_SSE) {
                      console.log('📡 SSE: Sending completion status to client');
                    }
                    
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'status', ...status })}\n\n`));
                    clearInterval(interval);
                    controller.close();
                    return;
                  } else if (apiData.message === "Still processing") {
                    // Still processing - continue waiting
                    if (DEBUG_SSE && checkCount % 30 === 0) {
                      console.log('📡 SSE: Still processing (API check):', requestId);
                    }
                  } else {
                    // Other message - log it
                    if (DEBUG_SSE && checkCount % 30 === 0) {
                      console.log('📡 SSE: API returned message:', apiData.message);
                    }
                  }
                } else {
                  if (DEBUG_SSE && checkCount % 30 === 0) {
                    console.log('📡 SSE: API response not OK:', apiResponse.status, apiResponse.statusText);
                  }
                }
              }
            } catch (apiError) {
              // API check failed - continue with database checks
              if (DEBUG_SSE && checkCount % 30 === 0) {
                console.log('📡 SSE: API fallback check failed:', apiError);
              }
            }
          }
          
          // No status found yet - still pending
          if (!dbStatus && lastStatus !== 'pending') {
            lastStatus = 'pending';
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'status', request_id: requestId, status: 'pending' })}\n\n`));
          }
          
          // Stop after max checks
          if (checkCount >= maxChecks) {
            if (DEBUG_SSE) {
              console.log('📡 SSE: Max checks reached, closing connection');
            }
            clearInterval(interval);
            controller.close();
          }
        } catch (error) {
          console.error('SSE status check error:', error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', error: 'Failed to check status' })}\n\n`));
        }
      }, 1000); // Check every second
      
      // Cleanup on client disconnect
      req.signal.addEventListener('abort', () => {
        if (DEBUG_SSE) {
          console.log('📡 SSE: Client disconnected');
        }
        clearInterval(interval);
        controller.close();
      });
      },
    });
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('SSE stream creation error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create SSE stream', details: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

