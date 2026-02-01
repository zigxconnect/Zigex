import { createSupabaseServerClient } from "../supabase/server"; // Ensure this path is correct
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { supabaseAdmin } from "../supabase/server";

export async function authMiddleware(request: Request) {
  // 1. Create a Supabase client using the standard factory
  const supabase = await createSupabaseServerClient();

  // 2. Get the user directly from the cookie session.
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // 3. If there's an error or no user, the session is invalid. Deny access.
  if (error || !user) {
    console.error(`[AUTH_MIDDLEWARE] Session failure for user ${user?.id || 'unknown'}:`, error?.message || "No user found");
    return NextResponse.json(
      { error: `Unauthorized: ${error?.message || "Invalid session"}` },
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

  if (companyError) {
    if (companyError.code === "PGRST116") {
      // No rows found, treat as not a company
    } else {
      console.error("Supabase company profile error:", companyError);
      return NextResponse.json(
        { error: "Internal server error: Could not fetch company profile" },
        { status: 500 }
      );
    }
  }
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

  if (studentError) {
    if (studentError.code === "PGRST116") {
      // No rows found, treat as not a student
    } else {
      console.error("Supabase student profile error:", studentError);
      return NextResponse.json(
        { error: "Internal server error: Could not fetch student profile" },
        { status: 500 }
      );
    }
  }
  if (studentProfile) {
    // The user is a student.
    return { user, student: studentProfile, type: "student" };
  }

  // 5. If the user is authenticated but has NEITHER a company nor a student profile,
  // they are unauthorized to perform actions.
  console.warn(`[AUTH_MIDDLEWARE] Authenticated user ${user.id} has no company or student profile record.`);
  return NextResponse.json(
    { error: "Unauthorized: Profile record (company/student) not found for this account" },
    { status: 401 }
  );
}
