// app/api/company/register/route.ts

import { supabaseAdmin } from "@/lib/supabase/server";
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

  // 1. Create the user and pass metadata to explicitly identify them as a company.
  const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
    email,
    password,
    options: {
      data: {
        user_role: "company", // This ensures our student-specific trigger will ignore this user.
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

  // 2. Manually create the company profile. This is now safe and will not conflict with the trigger.
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

  // 3. If profile creation fails, we must delete the auth user to prevent orphaned users.
  if (profileError) {
    console.error("Supabase Profile Creation Error:", profileError);
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
