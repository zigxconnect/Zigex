import { supabaseAdmin } from "@/lib/supabase/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Simple in-memory rate-limiter per email.
// NOTE: This is fine for single-process development. For production behind
// multiple instances, replace with a shared store (Redis, etc.).
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 5; // max attempts per window
const attempts = new Map<string, { count: number; first: number }>();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, token } = body ?? {};

    if (!email || !token) {
      return NextResponse.json(
        { error: "email and token required" },
        { status: 400 }
      );
    }

    // Rate-limit by email
    const now = Date.now();
    const key = email.toLowerCase();
    const entry = attempts.get(key);
    if (!entry || now - entry.first > RATE_LIMIT_WINDOW_MS) {
      attempts.set(key, { count: 1, first: now });
    } else {
      entry.count += 1;
      attempts.set(key, entry);
      if (entry.count > RATE_LIMIT_MAX) {
        const retryAfter = Math.ceil(
          (entry.first + RATE_LIMIT_WINDOW_MS - now) / 1000
        );
        return NextResponse.json(
          { error: "Too many attempts. Try again later.", retryAfter },
          { status: 429, headers: { "Retry-After": String(retryAfter) } }
        );
      }
    }

    // Verify the OTP using the service role client
    const { data: verifyData, error: verifyError } =
      await supabaseAdmin.auth.verifyOtp({
        email,
        token,
        type: "email",
      });

    if (verifyError) {
      console.warn("verify-otp-server verify failed", {
        email,
        code: (verifyError as any)?.code,
      });
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    const session = verifyData?.session;
    if (session && session.access_token && session.refresh_token) {
      const cookieStore = cookies();
      const anonUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

      const ss = createServerClient(anonUrl, anonKey, {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: "", ...options });
          },
        },
      });

      const { data: setData, error: setError } = await ss.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });

      if (setError) {
        console.error("verify-otp-server setSession failed", setError);
        return NextResponse.json(
          { error: "Failed to set server session" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { message: "Verified and server session set" },
      { status: 200 }
    );
  } catch (err) {
    console.error("verify-otp-server unexpected error", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
