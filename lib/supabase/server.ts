/* eslint-disable @typescript-eslint/no-unused-vars */
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * EXPORT 1: The Admin Client
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error(
    'CRITICAL: NEXT_PUBLIC_SUPABASE_URL is not set in environment variables.'
  );
}

if (!supabaseServiceRoleKey) {
  throw new Error(
    'CRITICAL: SUPABASE_SERVICE_ROLE_KEY is not set in environment variables.'
  );
}

const fetchWithRetry = async (url: any, options: any) => {
  // Skip retries during build to prevent timeout loops
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return fetch(url, { ...options, signal: AbortSignal.timeout(2000) });
  }
  
  const MAX_RETRIES = 3;
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      return await fetch(url, { ...options, signal: AbortSignal.timeout(10000) });
    } catch (error: any) {
      if (i === MAX_RETRIES - 1) throw error;
      const isTimeout = error.cause?.code === 'UND_ERR_CONNECT_TIMEOUT' || error.name === 'AbortError';
      // Only retry on network/timeout errors, though usually "fetch failed" covers these in Node
      // Exponential backoff: 500, 1000, 2000ms
      await new Promise(r => setTimeout(r, 500 * Math.pow(2, i)));
    }
  }
  return fetch(url, { ...options, signal: AbortSignal.timeout(10000) });
}

export const supabaseAdmin = createSupabaseClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  global: {
    fetch: fetchWithRetry,
  }
});

/**
 * EXPORT 2: The Server Action / User-Context Client Factory
 */
export async function createServerActionClient() {
  const cookieStore = await cookies();

  const anonUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!anonUrl || !anonKey) {
    throw new Error(
      'CRITICAL: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in environment variables.'
    );
  }

  return createServerClient(anonUrl, anonKey,
    {
      cookies: {
        async get(name: string) {
          return (await cookieStore).get(name)?.value;
        },
        async set(name: string, value: string, options: CookieOptions) {
          try {
            (await cookieStore).set({ name, value, ...options });
          } catch (error) { }
        },
        async remove(name: string, options: CookieOptions) {
          try {
            (await cookieStore).set({ name, value: "", ...options });
          } catch (error) { }
        },
      },
      global: {
        fetch: fetchWithRetry,
      }
    }
  );
}

/**
 * Creates a Supabase client for use in Server Components,
 * Route Handlers, and Server Actions.
 */
export const createSupabaseServerClient = async () => {
  const cookieStore = await cookies();
  const anonUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!anonUrl || !anonKey) {
    throw new Error(
      'CRITICAL: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in environment variables.'
    );
  }

  return createServerClient(anonUrl, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch (error) {
          // This can fail in Server Components, but we ignore it there
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options });
        } catch (error) {
          // This can fail in Server Components, but we ignore it there
        }
      },
    },
    global: {
      fetch: fetchWithRetry,
    }
  });
};

export { createSupabaseServerClient as createClient };
