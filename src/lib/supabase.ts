import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (supabaseInstance) return supabaseInstance;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Add debug logging
  console.log('Initializing Supabase with:', {
    url: supabaseUrl ? 'defined' : 'undefined',
    key: supabaseAnonKey ? 'defined' : 'undefined'
  });

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      `Missing environment variables: ${[
        !supabaseUrl && 'NEXT_PUBLIC_SUPABASE_URL',
        !supabaseAnonKey && 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      ]
        .filter(Boolean)
        .join(', ')}`
    );
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  console.log('Supabase client initialized successfully');
  return supabaseInstance;
}

// For backward compatibility
export const supabase = typeof window !== 'undefined' ? getSupabase() : null; 