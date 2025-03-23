import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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

  // For client components, reuse the instance
  if (typeof window !== 'undefined') {
    if (supabaseInstance) return supabaseInstance;
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    return supabaseInstance;
  }

  // For server components, create a new instance without cookies
  // since cookies() from next/headers is not compatible with pages/ directory
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    }
  });
}

// For backward compatibility
export const supabase = typeof window !== 'undefined' ? getSupabase() : null; 