// app/api/company/register/route.ts

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const {
    company_name,
    email,
    password,
    description,
    phone,
    address,
    website,
  } = await request.json();

  if (!email || !password || !company_name || !description) {
    return NextResponse.json(
      { error: "Company name, email, password, and description are required." },
      { status: 400 }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  // 1. Create a LOCAL anonymous client for sign-up.
  // This ensures we don't pollute a global instance with a user session.
  const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // 2. Create the user using the anonymous client.
  const { data: authData, error: authError } = await supabaseAnon.auth.signUp({
    email,
    password,
    options: {
      data: {
        user_role: "company",
      },
    },
  });

  if (authError || !authData.user) {
    console.error("Supabase Auth Error:", authError);
    return NextResponse.json(
      { error: authError?.message || "Could not sign up company user." },
      { status: 400 }
    );
  }

  const userId = authData.user.id;

  // 3. Create a LOCAL admin client for database operations.
  // This client uses the service role key and is guaranteed to be clean (no user session).
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // 4. Manually create the company profile using the admin client.
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

  // 5. If profile creation fails, delete the auth user to prevent orphans.
  if (profileError) {
    console.error("Supabase Profile Creation Error:", profileError);
    // Use the admin client to delete the user
    await supabaseAdmin.auth.admin.deleteUser(userId);
    return NextResponse.json(
      { error: "Failed to create company profile after authentication." },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: "Company registered successfully. Please proceed to sign in." },
    { status: 201 }
  );
}
