// app/api/auth/callback/route.ts

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    // 1. Get the cookie store instance.
    // const cookieStore = cookies();

    // 2. Create the Supabase client.
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: async (name: string) => {
            const cookieStore = await cookies();
            return cookieStore.get(name)?.value;
          },
          set: async (name: string, value: string, options: CookieOptions) => {
            const cookieStore = await cookies();
            cookieStore.set({ name, value, ...options });
          },
          remove: async (name: string, options: CookieOptions) => {
            const cookieStore = await cookies();
            cookieStore.set({ name, value: "", ...options });
          },
        },
      }
    );

    // 4. Exchange the code for a session.
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Redirect to an error page if something goes wrong.
  console.error("Auth callback error: Could not exchange code for session.");
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
