import { generateCSRFToken } from "@/lib/utils/csrf";

// GET: Return a CSRF token for the frontend
export async function GET() {
  const secret = process.env.CSRF_SECRET || 'dev-secret-please-change';
  const token = generateCSRFToken(secret);
  return NextResponse.json({ csrfToken: token });
}

import { createSupabaseServerClient, supabaseAdmin } from "@/lib/supabase/server";
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { withCSRFProtection } from "@/lib/utils/csrf";

// Upstash rate limiter: 5 login attempts per 15 minutes per email
// Only initialize if Upstash credentials are configured
let ratelimit: Ratelimit | null = null;

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(5, "15 m"),
      analytics: true,
    });
  } else {
    console.warn("⚠️  Upstash Redis credentials not configured. Rate limiting is disabled.");
  }
} catch (error) {
  console.error("Failed to initialize rate limiter:", error);
}

async function checkRateLimit(identifier: string) {
  // Skip rate limiting if not configured
  if (!ratelimit) {
    return { blocked: false, reset: 0 };
  }

  try {
    const { success, reset } = await ratelimit.limit(identifier);
    if (!success) {
      return {
        blocked: true,
        reset: Math.ceil((reset - Date.now()) / 1000),
      };
    }
    return { blocked: false, reset: 0 };
  } catch (error) {
    console.error("Rate limit check failed:", error);
    // On error, allow the request to proceed
    return { blocked: false, reset: 0 };
  }
}


const _POST = async function (request: Request) {
  const { email, password } = await request.json();
  console.log("Login attempt for email:", email);

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 }
    );
  }

  // Rate limit check (per email)
  const rate = await checkRateLimit(email);
  if (rate.blocked) {
    return NextResponse.json(
      { error: `Too many login attempts. Try again in ${rate.reset} seconds.` },
      { status: 429, headers: { "Retry-After": String(rate.reset) } }
    );
  }

  const supabase = await createSupabaseServerClient();

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
        } catch (e) { }

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

export const POST = withCSRFProtection(_POST);
