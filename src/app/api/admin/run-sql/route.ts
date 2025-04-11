import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// Only allow SQL execution in development or from localhost
const ALLOWED_HOSTS = ['localhost', '127.0.0.1'];

export async function POST(request: NextRequest) {
  console.log('Starting admin/run-sql API call');
  
  // Security check
  const host = request.headers.get('host') || '';
  const isDev = process.env.NODE_ENV === 'development';
  const isAllowedHost = ALLOWED_HOSTS.some(h => host.includes(h));
  
  if (!isDev && !isAllowedHost) {
    console.error(`Unauthorized SQL execution attempt from ${host}`);
    return NextResponse.json({ 
      error: 'This endpoint is only available in development or from localhost'
    }, { status: 403 });
  }
  
  try {
    const { query } = await request.json();
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid SQL query' }, { status: 400 });
    }
    
    console.log(`Executing SQL query: ${query.substring(0, 100)}${query.length > 100 ? '...' : ''}`);
    
    const supabaseAdmin = getSupabaseAdmin();
    
    // Try to execute the SQL using RPC first
    try {
      const { data, error, count } = await supabaseAdmin.rpc('execute_sql', {
        sql_query: query
      });
      
      if (error) {
        throw error;
      }
      
      return NextResponse.json({
        success: true,
        data,
        count,
        method: 'rpc'
      });
    } catch (rpcError) {
      console.warn('RPC error, trying direct query:', rpcError);
      
      // If RPC fails, try to run a SELECT query directly
      // This is safer than allowing arbitrary SQL execution
      if (query.trim().toUpperCase().startsWith('SELECT')) {
        try {
          const result = await supabaseAdmin
            .from('_exec_sql')
            .select('*')
            .limit(100);
          
          const { data, error, count } = result;
          
          if (error) {
            throw error;
          }
          
          return NextResponse.json({
            success: true,
            data,
            count,
            method: 'select'
          });
        } catch (selectError) {
          return NextResponse.json({ 
            success: false,
            error: 'Failed to execute query directly',
            details: selectError instanceof Error ? selectError.message : 'Unknown error'
          }, { status: 500 });
        }
      } else {
        return NextResponse.json({
          success: false,
          error: 'Only SELECT queries are allowed directly. For other queries, use RPC.',
          details: rpcError instanceof Error ? rpcError.message : 'Unknown error',
          fixSuggestion: 'Ensure execute_sql function exists and is properly defined.'
        }, { status: 400 });
      }
    }
  } catch (error) {
    console.error('Error in admin/run-sql:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Error executing SQL query',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper function to extract table name from a SQL query
function extractTableName(query: string): string | null {
  // Simple regex to extract table name from SELECT queries
  const match = query.match(/FROM\s+([^\s,;()]+)/i);
  
  if (match && match[1]) {
    // Clean up any schema prefixes and quotes
    let tableName = match[1].trim();
    
    // Remove schema prefix if exists
    if (tableName.includes('.')) {
      tableName = tableName.split('.').pop() || '';
    }
    
    // Remove quotes if exists (", ', `)
    tableName = tableName.replace(/^['"`]|['"`]$/g, '');
    
    return tableName;
  }
  
  return null;
} 