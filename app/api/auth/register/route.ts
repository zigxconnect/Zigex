// app/api/auth/register/route.ts

import { supabaseAdmin } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getURL } from "@/lib/utils";

export async function POST(request: Request) {
  // --- MODIFICATION 1: Receive the 'origin' from the request body ---
  const { email, password, fullName, origin } = await request.json();

  // Validate origin to prevent open-redirects.
  // Strategy:
  // 1) If origin is a relative path (starts with '/'), accept and prepend the configured base URL.
  // 2) If origin is an absolute URL, attempt to parse it and compare protocol+host against an allowlist.
  // 3) If origin is missing or invalid, fall back to the safe base URL from env.
  const safeBase =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3000";

  // Allowlist can be provided as a comma-separated env var (HOSTS or ORIGINS). Fallback to safeBase host.
  const allowedOriginsEnv =
    process.env.ALLOWED_ORIGINS ||
    process.env.NEXT_PUBLIC_ALLOWED_ORIGINS ||
    "";
  const allowedOrigins = allowedOriginsEnv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // Always include the configured safeBase origin in the allowlist (protocol + host)
  try {
    const parsedSafe = new URL(safeBase);
    const safeOrigin = `${parsedSafe.protocol}//${parsedSafe.host}`;
    if (!allowedOrigins.includes(safeOrigin)) allowedOrigins.push(safeOrigin);
  } catch {
    // ignore parse errors and proceed; safeBase might be a relative path
  }

  let validatedOrigin = safeBase; // default fallback

  if (origin) {
    // If origin looks like a relative path, accept and build full URL
    if (typeof origin === "string" && origin.startsWith("/")) {
      validatedOrigin = `${safeBase.replace(/\/$/, "")}${origin}`;
    } else {
      // Try to parse as absolute URL and compare protocol+host to allowlist
      try {
        const parsed = new URL(origin);
        const originKey = `${parsed.protocol}//${parsed.host}`;
        if (allowedOrigins.includes(originKey)) {
          validatedOrigin = `${parsed.protocol}//${parsed.host}`;
        } else {
          // Not allowed: keep the safe fallback and log
          console.warn(`Blocked registration redirect origin: ${origin}`);
        }
      } catch {
        // Parsing failed: treat as invalid and keep fallback
        console.warn(`Invalid registration origin provided: ${origin}`);
      }
    }
  }

  if (!email || !password || !fullName) {
    return NextResponse.json(
      { error: "All fields are required." },
      { status: 400 }
    );
  }

  // This check is great custom logic and should remain untouched.
  const { data: companyProfile, error } = await supabaseAdmin
    .from("company_profiles")
    .select("user_id")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    console.error(
      "Error querying company_profiles for registration check:",
      error
    );
    return NextResponse.json(
      { error: "Internal server error while validating email." },
      { status: 500 }
    );
  }

  if (companyProfile) {
    return NextResponse.json(
      {
        error:
          "This email is registered to a company. Please use a different email or sign in as a company.",
      },
      { status: 409 }
    );
  }


  // --- REFACTOR: Use generateLink to create user and get verification link without sending default email ---
  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: "signup",
    email,
    password,
    options: {
      redirectTo: `${getURL()}api/auth/callback?next=/create-profile`,
      data: {
        full_name: fullName,
        user_role: "student",
      },
    },
  });

  if (linkError || !linkData.user) {
    if (linkError?.message.includes("already registered")) {
      return NextResponse.json(
        { error: "A user with this email already exists." },
        { status: 400 }
      );
    }
    console.error("Supabase Admin GenerateLink Error:", linkError?.message);
    return NextResponse.json(
      { error: linkError?.message || "There was an error creating the user." },
      { status: 400 }
    );
  }

  // Send the custom verification email using Nodemailer
  // The 'action_link' is the full URL to verify the email
  const verificationLink = linkData.properties?.action_link;

  if (verificationLink) {
    const { sendVerificationEmail } = await import("@/lib/email");
    try {
      await sendVerificationEmail({
        email,
        name: fullName,
        link: verificationLink,
      });
    } catch (emailErr) {
      console.error("Failed to send custom verification email:", emailErr);
      // We don't fail the request, but we log it. User might need to resend.
    }
  }

  return NextResponse.json(
    {
      message:
        "Registration successful. Please check your email (and spam) to verify your account.",
    },
    { status: 201 }
  );
}
