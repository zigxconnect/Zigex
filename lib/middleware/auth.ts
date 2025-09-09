// lib/middleware/auth.ts (or wherever your file is located)

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "../supabase/server"; // Ensure this path is correct

export async function authMiddleware(request: Request) {
  // --- START OF CORRECTED LOGIC ---

  // 1. Create a Supabase client that can read the request's cookies.
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  // 2. Get the user directly from the cookie session.
  // This replaces the old logic of looking for a Bearer token.
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // 3. If there's an error or no user, the session is invalid. Deny access.
  if (error || !user) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid or missing session cookie" },
      { status: 401 }
    );
  }

  // --- END OF CORRECTED LOGIC ---


  // 4. Now that we have the user, check if they are a company or student.
  // This part of your logic was good, we just re-order it slightly for clarity.

  // First, check for a company profile.
  const { data: companyProfile, error: companyError } = await supabaseAdmin
    .from("company_profiles")
    .select("*")
    .eq("user_id", user.id) // IMPORTANT: Make sure this column name is correct
    .single();

  if (companyProfile) {
    // If a company profile is found, we are done. The user is a company.
    return { user, company: companyProfile, type: "company" };
  }

  // If not a company, check for a student profile.
  const { data: studentProfile, error: studentError } = await supabaseAdmin
    .from("student_profiles")
    .select("*")
    .eq("user_id", user.id) // IMPORTANT: Make sure this column name is correct
    .single();

  if (studentProfile) {
    // The user is a student.
    return { user, student: studentProfile, type: "student" };
  }

  // 5. If the user is authenticated but has NEITHER a company nor a student profile,
  // they are unauthorized to perform actions.
  return NextResponse.json(
    { error: "Unauthorized: User profile not found" },
    { status: 401 }
  );
}