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

  // 1. Check if user is a company
  const { data: companyProfile } = await supabase
    .from("company_profiles")
    .select("role")
    .eq("email", email)
    .single();

  if (companyProfile) {
    // Company flow: Send OTP. The session is created later in the /api/auth/verify-otp endpoint.
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
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
        otpSent: true,
        email: email,
      },
      { status: 200 }
    );
  }

  // 2. If not a company, check if it's a student and attempt password login
  const { data: studentProfile } = await supabase
    .from("student_profiles")
    .select("profile_status")
    .eq("email", email)
    .single();

  if (studentProfile) {
    // --- MODIFICATION START ---
    // Change: We now capture the response from signInWithPassword
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }
    
    // Explanation: On success, `signInWithPassword` sets the auth cookies AND returns session data.
    // We can now include this session data (which contains the access_token) in our JSON response.
    // This allows the client-side to store the token if needed, for example, in a state management library
    // or localStorage for UI purposes.
    return NextResponse.json(
      {
        message: "Login successful",
        profileComplete: studentProfile.profile_status === "complete",
        session: data.session, // <-- RETURN THE SESSION OBJECT
      },
      { status: 200 }
    );
    // --- MODIFICATION END ---
  }

  // 3. If the email is in neither table, it's an invalid user.
  return NextResponse.json(
    { error: "Invalid email or password." },
    { status: 401 }
  );
}