import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { loginRateLimiter } from "@/lib/rate-limit";

export async function POST(request: Request) {
  // Rate Limiting
  const ip = (await headers()).get("x-forwarded-for") || "unknown";
  if (!loginRateLimiter.check(ip)) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429 }
    );
  }

  const { email, password } = await request.json();
  console.log("Login attempt for email:", email);

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 }
    );
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: async (name: string) => {
          const cookieStore = await cookies();
          return cookieStore.get(name)?.value;
        },
        set: async (name: string, value: string, options: CookieOptions) => {
          const cookieStore = await cookies();
          cookieStore.set({ name, value, ...options });
        },
        remove: async (name: string, options: CookieOptions) => {
          const cookieStore = await cookies();
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
    console.log("Company profile found:");
    console.table(companyProfile);
    // Company flow: Send OTP.
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    });

    if (otpError) {
      // If Supabase reports an email send rate limit, return a 200 with
      // otpSent=true so the client knows an OTP was recently requested and
      // should proceed to the verification screen instead of showing a
      // server error. This avoids confusing 500 errors while respecting the
      // provider's rate limit.
      if (
        (otpError as any)?.status === 429 ||
        (otpError as any)?.code === "over_email_send_rate_limit"
      ) {
        console.warn("Supabase OTP rate limit:", otpError);
        // Try to extract suggested wait time from message, default to 10s
        let retryAfter = 10;
        try {
          const m = String((otpError as any).message || "").match(
            /after\s+(\d+)\s+seconds?/i
          );
          if (m) retryAfter = Number(m[1]);
        } catch (e) {}

        return NextResponse.json(
          {
            message: "OTP was recently requested. Please check your email.",
            otpSent: true,
            email: email,
            retryAfter,
          },
          { status: 200, headers: { "Retry-After": String(retryAfter) } }
        );
      }

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

  // 2. If not a company, attempt password login FIRST (Timing Attack Prevention)
  // We do NOT check for student profile existence before auth.
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

  // 3. Auth successful, NOW check if it's a student
  const { data: studentProfile } = await supabase
    .from("student_profiles")
    .select("profile_status")
    .eq("email", email)
    .single();

  if (studentProfile) {
    return NextResponse.json(
      {
        message: "Login successful",
        profileComplete: studentProfile.profile_status === "complete",
        session: data.session,
      },
      { status: 200 }
    );
  }

  // 4. If authenticated but not a student (and we already checked company),
  // this is an edge case (maybe a user without a profile row yet, or wrong role).
  // We should sign them out to be safe, or just return error.
  await supabase.auth.signOut();

  return NextResponse.json(
    { error: "Invalid email or password." }, // Generic error to maintain ambiguity
    { status: 401 }
  );
}
