// app/api/auth/callback/route.ts

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
  // 1. Await cookies() as required by Next.js 14+
  const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          // The 'get' method must now be async
          async get(name: string) {
            const cookie = await cookieStore.get(name);
            return cookie?.value;
          },
          // 'set' and 'remove' methods must be async and awaited
          async set(name: string, value: string, options: CookieOptions) {
            await cookieStore.set({ name, value, ...options });
          },
          async remove(name: string, options: CookieOptions) {
            await cookieStore.set({ name, value: "", ...options });
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
