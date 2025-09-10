// app/api/auth/register/route.ts

import { supabaseAdmin } from "@/lib/supabase/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, password, fullName } = await request.json();
  if (!email || !password || !fullName) {
    return NextResponse.json(
      { error: "All fields are required." },
      { status: 400 }
    );
  }

  // 1. Create the user and pass metadata for the trigger.
  const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        user_role: "student", // This metadata tells our trigger to create a student profile.
      },
    },
  });

  if (authError || !authData.user) {
    if (authError?.message.includes("User already registered")) {
      return NextResponse.json(
        { error: "A user with this email already exists." },
        { status: 400 }
      );
    }
    console.error("Supabase SignUp Error:", authError?.message);
    return NextResponse.json(
      { error: "There was an error creating the user." },
      { status: 400 }
    );
  }

  // The manual profile creation is correctly removed, as the trigger handles it.

  // 2. Sign in the new user to create a session.
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    }
  );

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    return NextResponse.json(
      { message: "Registration successful, but auto-login failed." },
      { status: 201 }
    );
  }

  return NextResponse.json(
    { message: "Student registered and logged in successfully" },
    { status: 201 }
  );
}
