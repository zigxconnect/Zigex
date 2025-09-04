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

  // 1. Use the admin client to create the user.
  const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
    email,
    password,
  });

  if (authError || !authData.user) {
    return NextResponse.json(
      { error: authError?.message || "Could not sign up user." },
      { status: 400 }
    );
  }

  // 2. Create the corresponding profile for the new user.
  const { error: profileError } = await supabaseAdmin
    .from("student_profiles")
    .insert({
      user_id: authData.user.id,
      full_name: fullName,
      email: email,
      profile_status: "incomplete",
      role: "student",
    });

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json(
      { error: "Failed to create student profile." },
      { status: 500 }
    );
  }

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

  // The user is created and a session cookie is now set in their browser.
  return NextResponse.json(
    { message: "Student registered and logged in successfully" },
    { status: 201 }
  );
}
