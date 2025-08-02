import { createClient } from "@supabase/supabase-js";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * EXPORT 1: The Admin Client
 * --------------------------
 * This client uses the powerful `SERVICE_ROLE_KEY` and has super-admin privileges.
 * It is designed to bypass all Row Level Security (RLS) policies.
 *
 * WHEN TO USE IT:
 * Use this ONLY for specific server-side tasks where you need to perform actions
 * that a regular user is not permitted to do, such as:
 *  - Creating a user's profile immediately after they sign up.
 *  - Performing administrative cleanup tasks.
 *
 * SECURITY WARNING:
 * NEVER expose this client or its `SUPABASE_SERVICE_ROLE_KEY` to the browser or
 * any client-side code. This key provides full access to your database.
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
 * ---------------------------------------------------------
 * This function creates a Supabase client that acts on behalf of the current user.
 * It reads the user's session from the incoming request's cookies and respects all RLS policies.
 *
 * WHEN TO USE IT:
 * Use this in Server Components, API Routes, and Middleware whenever you are
 * fetching or manipulating data for the currently logged-in user. For example:
 *  - Fetching the user's profile in a Server Component.
 *  - Updating a user's own data in an API route.
 *  - Checking a user's session in Middleware.
 */
export function createServerActionClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL! ||
      "https://tmvipinvvhgklmqwvows.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdmlwaW52dmhna2xtcXd2b3dzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxODI0ODIsImV4cCI6MjA2Nzc1ODQ4Mn0.QJWhxJzHgdP07_YTBOmS7i8P-ZWMK2VaNZmD1fwBPho", // This client uses the public anonymous key
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // This is a known issue with Next.js Middleware and can be safely ignored
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
