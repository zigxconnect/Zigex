import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase client that can run in the browser (in client components).
 * This version from '@supabase/ssr' is essential for correctly reading the
 * authentication cookies set by server components and API routes.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
