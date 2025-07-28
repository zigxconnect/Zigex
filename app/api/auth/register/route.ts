import { supabaseAdmin } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Handles new student registration.
 * This is a server-side API route that securely creates a new user and their profile.
 */
export async function POST(request: Request) {
  // 1. Get and validate the required fields from the request body.
  const { email, password, fullName } = await request.json();

  if (!email || !password || !fullName) {
    return NextResponse.json(
      { error: "Email, password, and full name are required." },
      { status: 400 } // Bad Request
    );
  }

  // 2. Create the user in Supabase Auth using the powerful ADMIN client.
  //    This step requires the SERVICE_ROLE_KEY to have the necessary permissions.
  const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
    email,
    password,
  });

  // Handle any errors from the authentication step.
  if (authError || !authData.user) {
    console.error("Supabase Auth Error:", authError);
    return NextResponse.json(
      { error: authError?.message || "Could not sign up user." },
      { status: 400 } // Bad Request, e.g., user already exists, weak password.
    );
  }

  const userId = authData.user.id;

  // 3. Use the ADMIN client again to create the corresponding profile in the 'student_profiles' table.
  const { error: profileError } = await supabaseAdmin
    .from("student_profiles")
    .insert({
      user_id: userId,
      full_name: fullName,
      profile_status: "incomplete", // Explicitly set the initial profile status.
    });

  // 4. This is a critical error handling step. If creating the profile fails,
  //    we must delete the user we just created in Auth to prevent "orphaned" users.
  if (profileError) {
    console.error("Supabase Profile Creation Error:", profileError);

    // Perform cleanup by deleting the orphaned auth user.
    await supabaseAdmin.auth.admin.deleteUser(userId);

    return NextResponse.json(
      { error: "Failed to create user profile after authentication." },
      { status: 500 } // Internal Server Error
    );
  }

  // 5. If both the auth user and the profile were created successfully, return a success response.
  return NextResponse.json(
    { message: "Student registered successfully", user: authData.user },
    { status: 201 } // Created
  );
}
