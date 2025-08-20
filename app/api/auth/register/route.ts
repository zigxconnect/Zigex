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
