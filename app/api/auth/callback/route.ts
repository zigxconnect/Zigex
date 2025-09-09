// app/api/auth/callback/route.ts

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    // 1. Call cookies() SYNCHRONOUSLY. Do NOT use await.
    const cookieStore = cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          // The 'get' method can remain synchronous
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          // 2. Make the 'set' and 'remove' methods ASYNC
          async set(name: string, value: string, options: CookieOptions) {
            // This is an async context, so Next.js is happy.
            cookieStore.set({ name, value, ...options });
          },
          async remove(name: string, options: CookieOptions) {
            // This is also an async context.
            cookieStore.set({ name, value: "", ...options });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  console.error(
    "Auth callback error: No code received or session exchange failed."
  );
  // Redirect to an error page for the user
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
