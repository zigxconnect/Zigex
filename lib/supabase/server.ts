<<<<<<< HEAD
import { createServerClient, CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
=======
/* eslint-disable @typescript-eslint/no-unused-vars */
import { createClient } from "@supabase/supabase-js";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
>>>>>>> 273ed6e6992338811da974c3ebbec65e700ee996

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!||"https://tmvipinvvhgklmqwvows.supabase.co";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!|| "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdmlwaW52dmhna2xtcXd2b3dzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjE4MjQ4MiwiZXhwIjoyMDY3NzU4NDgyfQ.8YJlls7rDdK5DvezGosyRbk7gMUHXXAK8XqZlwGZMWU";

// Log the variables to check if they are loaded correctly
// console.log('Supabase URL:', supabaseUrl);
// console.log('Supabase Service Role Key Loaded:', !!supabaseServiceRoleKey);

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
export async function createServerActionClient() {
  const cookieStore = await cookies();

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
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (error) {
            
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
