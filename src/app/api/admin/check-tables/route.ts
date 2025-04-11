import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// Only allow this endpoint in development or from localhost
const ALLOWED_HOSTS = ['localhost', '127.0.0.1'];

export async function GET(request: NextRequest) {
  console.log('Starting admin/check-tables API call');
  
  // Security check
  const host = request.headers.get('host') || '';
  const isDev = process.env.NODE_ENV === 'development';
  const isAllowedHost = ALLOWED_HOSTS.some(h => host.includes(h));
  
  if (!isDev && !isAllowedHost) {
    console.error(`Unauthorized tables check attempt from ${host}`);
    return NextResponse.json({ 
      error: 'This endpoint is only available in development or from localhost'
    }, { status: 403 });
  }
  
  try {
    console.log('Getting admin supabase client');
    const supabaseAdmin = getSupabaseAdmin();
    
    // Check subscriptions table
    console.log('Checking subscriptions table');
    const { data: subscriptions, error: subscriptionsError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .limit(10);
      
    // Check user_trials table
    console.log('Checking user_trials table');
    const { data: userTrials, error: userTrialsError } = await supabaseAdmin
      .from('user_trials')
      .select('*')
      .limit(10);
      
    // Check RLS policies
    console.log('Checking RLS policies');
    const { data: policies, error: policiesError } = await supabaseAdmin.rpc(
      'execute_sql',
      {
        sql_query: `
          SELECT 
            schemaname, 
            tablename, 
            policyname, 
            permissive,
            roles,
            cmd,
            qual,
            with_check
          FROM 
            pg_policies 
          WHERE 
            tablename IN ('subscriptions', 'user_trials')
        `
      }
    );
    
    // Check database functions
    console.log('Checking database functions');
    const { data: functions, error: functionsError } = await supabaseAdmin.rpc(
      'execute_sql',
      {
        sql_query: `
          SELECT 
            n.nspname as schema,
            p.proname as name,
            pg_get_function_arguments(p.oid) as arguments
          FROM 
            pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
          WHERE 
            n.nspname = 'public' AND
            p.proname IN ('admin_create_subscription', 'execute_sql')
        `
      }
    );
    
    return NextResponse.json({
      tables: {
        subscriptions: {
          exists: !subscriptionsError || subscriptionsError.code !== 'PGRST204',
          data: subscriptions || [],
          error: subscriptionsError ? subscriptionsError.message : null
        },
        user_trials: {
          exists: !userTrialsError || userTrialsError.code !== 'PGRST204',
          data: userTrials || [],
          error: userTrialsError ? userTrialsError.message : null
        }
      },
      policies: {
        data: policies || [],
        error: policiesError ? policiesError.message : null
      },
      functions: {
        data: functions || [],
        error: functionsError ? functionsError.message : null
      }
    });
  } catch (error) {
    console.error('Error in admin/check-tables:', error);
    return NextResponse.json({ 
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 