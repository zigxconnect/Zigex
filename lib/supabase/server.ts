/* eslint-disable @typescript-eslint/no-unused-vars */
import { createClient } from "@supabase/supabase-js";
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

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
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
          } catch (error) {}
        },
        async remove(name: string, options: CookieOptions) {
          try {
            (await cookieStore).set({ name, value: "", ...options });
          } catch (error) {}
        },
      },
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
    },
  });
};
