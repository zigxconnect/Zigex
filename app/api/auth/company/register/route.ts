import { supabaseAdmin } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Handles new COMPANY registration.
 * This API route now accepts all fields from the sign-up form and saves them.
 */
export async function POST(request: Request) {
  // 1. Get ALL the fields from the request body.
  const {
    company_name,
    email,
    password,
    description,
    phone,
    address,
    website,
  } = await request.json();

  // Basic validation for the required fields
  if (!email || !password || !company_name || !description) {
    return NextResponse.json(
      { error: "Company name, email, password, and description are required." },
      { status: 400 }
    );
  }

  // 2. Create the user in Supabase Auth.
  const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
    email,
    password,
  });

  if (authError || !authData.user) {
    console.error("Supabase Auth Error:", authError);
    return NextResponse.json(
      { error: authError?.message || "Could not sign up company user." },
      { status: 400 }
    );
  }

  const userId = authData.user.id;

  // 3. THE FIX IS HERE:
  //    Create the corresponding profile, now including ALL the extra fields.
  const { error: profileError } = await supabaseAdmin
    .from("company_profiles")
    .insert({
      user_id: userId,
      company_name: company_name,
      email: email,
      description: description,
      phone: phone,
      address: address,
      website_url: website,
      role: "company",
    });

  // 4. Critical error handling remains the same.
  if (profileError) {
    console.error("Supabase Profile Creation Error:", profileError);
    await supabaseAdmin.auth.admin.deleteUser(userId);
    return NextResponse.json(
      { error: "Failed to create company profile after authentication." },
      { status: 500 }
    );
  }

  // 5. Return success.
  return NextResponse.json(
    { message: "Company registered successfully. Please proceed to sign in." },
    { status: 201 }
  );
}
