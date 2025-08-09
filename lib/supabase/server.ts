import { createClient } from "@supabase/supabase-js";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * EXPORT 1: The Admin Client
 * This client uses the powerful SERVICE_ROLE_KEY and has super-admin privileges.
 * It is designed to bypass all Row Level Security (RLS) policies.
 * Use this ONLY for specific server-side tasks that a regular user cannot do.
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
 * This is the primary client you will use in Server Actions, API Routes, and Server Components.
 * It acts on behalf of the current user by reading their session from cookies.
 */
export function createServerActionClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL! ||
      "https://tmvipinvvhgklmqwvows.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdmlwaW52dmhna2xtcXd2b3dzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjE4MjQ4MiwiZXhwIjoyMDY3NzU4NDgyfQ.8YJlls7rDdK5DvezGosyRbk7gMUHXXAK8XqZlwGZMWU",
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // This can be ignored
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // Same as above
          }
        },
      },
    }
  );
}
