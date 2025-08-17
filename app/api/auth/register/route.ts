// Use your dedicated admin client
import { supabaseAdmin } from "@/lib/supabase/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr"; // Import for auto-login
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, password, fullName } = await request.json();

  // Validate required fields
  if (!email || !password || !fullName) {
    console.log('Validation Error: Missing required fields.', { email, password, fullName });
    return NextResponse.json(
      { error: 'Email, password, and full name are required.' },
      { status: 400 }
    );
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { error: 'Invalid email format.' },
      { status: 400 }
    );
  }

  // Check for existing user
  const { data: existingUser } = await supabaseAdmin
    .from('student_profiles')
    .select('*')
    .eq('email', email)
    .single();

  if (existingUser) {
    return NextResponse.json(
      { error: "Email, password, and full name are required." },
      { status: 400 }
    );
  }

  // 1. Create the user in Supabase Auth using the ADMIN client.
  const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
    email,
    password,
  });

  if (authError || !authData.user) {
    console.error('Supabase Auth Error:', authError);
    return NextResponse.json(
      { error: authError?.message || "Could not sign up user." },
      { status: 400 }
    );
  }

  console.log(`Auth user created successfully with ID: ${authData.user.id}`);
  const userId = authData.user.id;

  // 2. Create the corresponding profile in the 'student_profiles' table.
  const { error: profileError } = await supabaseAdmin
    .from('student_profiles')
    .insert({
      user_id: userId,
      full_name: fullName,
      profile_status: "incomplete",
    });

  if (profileError) {
    console.error("Supabase Profile Creation Error:", profileError);
    await supabaseAdmin.auth.admin.deleteUser(userId); // Cleanup orphaned auth user
    return NextResponse.json(
      { error: "Failed to create user profile after authentication." },
      { status: 500 }
    );
  }

  // 3. NEW: Automatically log the user in to create a session.
  const cookieStore = await cookies();
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
    // This is a critical fallback. The user was created but could not be logged in.
    console.error("Auto-login failed after sign-up:", signInError);
    // We still return a success because the user exists, but we can't create a session.
    // The user will have to log in manually.
    return NextResponse.json(
      {
        message:
          "Registration successful, but auto-login failed. Please log in manually.",
      },
      { status: 201 }
    );
  }

  // 4. Return a success response. The session cookie is now set.
  return NextResponse.json(
    {
      message: "Student registered and logged in successfully",
      user: authData.user,
    },
    { status: 201 }
  );
}