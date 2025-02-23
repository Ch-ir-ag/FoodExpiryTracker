import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient | null = null;

try {
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

  supabase = createClient(supabaseUrl, supabaseAnonKey);
} catch (error) {
  console.warn('Failed to initialize Supabase client:', error);
  // Provide a dummy client or null for SSG
  supabase = null;
}

export { supabase }; 