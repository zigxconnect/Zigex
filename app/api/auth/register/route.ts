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

  const { data: companyProfile, error } = await supabaseAdmin
    .from("company_profiles")
    .select("user_id")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    console.error(
      "Error querying company_profiles for registration check:",
      error
    );
    return NextResponse.json(
      { error: "Internal server error while validating email." },
      { status: 500 }
    );
  }

  if (companyProfile) {
    return NextResponse.json(
      {
        error:
          "This email is registered to a company. Please use a different email or sign in as a company.",
      },
      { status: 409 }
    );
  }

  const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        user_role: "student",
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
