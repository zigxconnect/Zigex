import { supabaseAdmin } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { company_name, email, password } = await request.json();
  if (!email || !password || !company_name) {
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
    .from("company_profiles")
    .insert({
      user_id: authData.user.id,
      company_name: company_name,
      email: email,
      role: "company",
    });

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json(
      { error: "Failed to create company profile." },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: "Company registered successfully. Please sign in." },
    { status: 201 }
  );
}
