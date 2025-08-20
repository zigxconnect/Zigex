import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 }
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

  // --- THE TWO-STEP LOOKUP LOGIC ---

  // 1. First, check the company_profiles table to see if the user is a company.
  //    This query is fast because we only select one column.
  const { data: companyProfile } = await supabase
    .from("company_profiles")
    .select("role")
    .eq("email", email)
    .single();

  if (companyProfile) {
    // If a profile is found, we know it's a company. Initiate the OTP flow.
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false, // Don't create a new user if they don't exist
      },
    });

    if (otpError) {
      console.error("Supabase OTP Error:", otpError);
      return NextResponse.json(
        { error: "Failed to send verification code. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "OTP sent to your email.",
        otpSent: true, // This flag tells the frontend to redirect to the OTP page
        email: email,
      },
      { status: 200 }
    );
  }

  // 2. If not a company, check the student_profiles table.
  const { data: studentProfile } = await supabase
    .from("student_profiles")
    .select("profile_status")
    .eq("email", email)
    .single();

  if (studentProfile) {
    // If a profile is found, it's a student. Proceed with the standard password login.
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        message: "Login successful",
        profileComplete: studentProfile.profile_status === "complete",
      },
      { status: 200 }
    );
  }

  // 3. If the email is in NEITHER table, it's an invalid user.
  return NextResponse.json(
    { error: "Invalid email or password." },
    { status: 401 }
  );
}
