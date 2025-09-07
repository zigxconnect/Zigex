/* eslint-disable @typescript-eslint/no-unused-vars */
import { createClient } from "@supabase/supabase-js";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * EXPORT 1: The Admin Client
 */
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL! ||
  "https://tmvipinvvhgklmqwvows.supabase.co";
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY! ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdmlwaW52dmhna2xtcXd2b3dzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjE4MjQ4MiwiZXhwIjoyMDY3NzU4NDgyfQ.8YJlls7rDdK5DvezGosyRbk7gMUHXXAK8XqZlwGZMWU";

if (!supabaseServiceRoleKey) {
  throw new Error(
    "CRITICAL: SUPABASE_SERVICE_ROLE_KEY is not set in .env.local. The application cannot perform administrative tasks."
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
export function createServerActionClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL! ||
      "https://tmvipinvvhgklmqwvows.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdmlwaW52dmhna2xtcXd2b3dzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxODI0ODIsImV4cCI6MjA2Nzc1ODQ4Mn0.QJWhxJzHgdP07_YTBOmS7i8P-ZWMK2VaNZmD1fwBPho",
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {}
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
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
export const createSupabaseServerClient = () => {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
};
