import { createSupabaseServerClient, supabaseAdmin } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Handles resending an OTP (One-Time Password) to a user's email.
 */
export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();

  // Use the signInWithOtp function to resend the code.
  // `shouldCreateUser: false` ensures it won't create a new user by mistake.
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
    },
  });

  if (error) {
    console.error("Resend OTP Error:", error);
    return NextResponse.json(
      { error: "Failed to resend verification code." },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: "A new verification code has been sent." },
    { status: 200 }
  );
}
