import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// Global singleton pattern for client-side
// This prevents multiple client instances during Next.js hot reloading
const globalForSupabase = globalThis as unknown as {
  supabaseClient: SupabaseClient | undefined;
};

/**
 * Create Supabase client for browser/client-side operations
 * Uses singleton pattern to prevent multiple instances during hot reload
 */
export function createClient(): SupabaseClient {
  if (!globalForSupabase.supabaseClient) {
    globalForSupabase.supabaseClient = createBrowserClient(
      supabaseUrl!,
      supabaseKey!
    );
  }

  return globalForSupabase.supabaseClient;
}

