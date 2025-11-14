import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Global singleton pattern following official Supabase documentation
// This prevents multiple client instances during Next.js hot reloading
const globalForSupabase = globalThis as unknown as {
  supabaseServer: SupabaseClient | undefined;
};

/**
 * Create Supabase client for server-side operations using service role key
 * Uses singleton pattern to prevent multiple instances during hot reload
 */
export function getSupabaseServerClient(): SupabaseClient {
  if (!globalForSupabase.supabaseServer) {
    if (!supabaseServiceKey) {
      throw new Error(
        'SUPABASE_SERVICE_ROLE_KEY is required for server-side operations. ' +
        'Get it from: Supabase Dashboard → Settings → API → service_role key'
      );
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[Supabase] Creating server client with service role key (bypasses RLS)');
    }

    globalForSupabase.supabaseServer = createSupabaseClient(
      supabaseUrl!,
      supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }

  return globalForSupabase.supabaseServer;
}

/**
 * Create Supabase client for server-side operations (SSR with cookies)
 * For use in Server Components/API routes that need cookie-based auth
 */
export async function createClient() {
  // Use service role key singleton if available (bypasses RLS)
  if (supabaseServiceKey) {
    return getSupabaseServerClient();
  }

  // Fallback to SSR client with cookies (for anon key with RLS)
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      '[Supabase] ⚠️  Service role key not found! Using anon key. ' +
      'Add SUPABASE_SERVICE_ROLE_KEY to .env to fix RLS issues.'
    );
  }

  const cookieStore = await cookies();
  return createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
        }
      },
    },
  });
}

