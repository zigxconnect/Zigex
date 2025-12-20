import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase client that can run in the browser (in client components).
 * This version from '@supabase/ssr' is essential for correctly reading the
 * authentication cookies set by server components and API routes.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase URL or Key is missing in environment variables.");
    throw new Error("Supabase configuration is missing.");
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}
