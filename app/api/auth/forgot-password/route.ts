// app/api/auth/forgot-password/route.ts

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let email: string | undefined;
  try {
    const body = await request.json();
    email = typeof body.email === "string" ? body.email.trim() : undefined;
  } catch {
    return NextResponse.json(
      { error: "Malformed JSON in request body." },
      { status: 400 }
    );
  }

  // Basic email format validation (RFC 5322 Official Standard)
  const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  if (!email || !emailRegex.test(email)) {
    return NextResponse.json(
      { error: "A valid email address is required." },
      { status: 400 }
    );
  }

  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
    return NextResponse.json(
      { error: "Internal server error: Supabase configuration missing." },
      { status: 500 }
    );
  }
  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name, options) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );

  // This is the URL the user will be redirected to after clicking the reset link.
  // It must be the page where you will build the "Update Password" form.
  const redirectTo = `${new URL(request.url).origin}/update-password`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json(
      { error: "Could not send password reset email. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: "Password reset link has been sent to your email." },
    { status: 200 }
  );
}
