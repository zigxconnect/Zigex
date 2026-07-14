// app/api/auth/callback/route.ts

import { createSupabaseServerClient, supabaseAdmin } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sanitizeRedirectUrl } from "@/lib/utils/redirect";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Validate the return URL to prevent open-redirect attacks.
  // sanitizeRedirectUrl enforces a strict allowlist of permitted path prefixes.
  const next = sanitizeRedirectUrl(searchParams.get("next"));

  if (code) {
    const supabase = await createSupabaseServerClient();

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("Auth exchange error:", error.message);
        return NextResponse.redirect(`${origin}/auth/auth-code-error`);
      }

      if (data?.user) {
        const user = data.user;

        const { data: companyProfile } = await supabaseAdmin
          .from("company_profiles")
          .select("user_id")
          .eq("email", user.email)
          .maybeSingle();

        if (companyProfile) {
          await supabase.auth.signOut();

          const redirectUrl = new URL("/sign-in", origin);
          redirectUrl.searchParams.set("error", "company_otp_required");
          redirectUrl.searchParams.set(
            "error_description",
            "Company accounts must sign in with email and password to receive a verification code."
          );
          return NextResponse.redirect(redirectUrl);
        }

        // If the user is not a company, proceed with the normal student flow.
        const { data: studentProfile, error: profileError } =
          await supabaseAdmin
            .from("student_profiles")
            .select("user_id, profile_status")
            .eq("user_id", user.id)
            .maybeSingle();

        if (profileError) {
          console.error("Error fetching student profile:", profileError);
          return NextResponse.redirect(`${origin}/auth/auth-code-error`);
        }

        if (studentProfile && studentProfile.profile_status === "complete") {
          return NextResponse.redirect(`${origin}${next}`);
        }

        if (!studentProfile) {
          const metadata = (user.user_metadata || {}) as Record<
            string,
            unknown
          >;
          const full_name = metadata.full_name || metadata.name || null;
          const avatar_url = metadata.avatar_url || metadata.picture || null;

          await supabaseAdmin.from("student_profiles").insert({
            user_id: user.id,
            email: user.email,
            full_name,
            avatar_url,
            profile_status: "incomplete",
          });
        }

        // If we're on a password recovery flow, prioritize the update-password page
        if (next === "/update-password") {
          return NextResponse.redirect(`${origin}${next}`);
        }

        // If profile is incomplete or new, force redirect to completion flow
        return NextResponse.redirect(`${origin}/create-profile`);
      }
    } catch (err) {
      console.error("Auth callback unexpected error:", err);
      return NextResponse.redirect(`${origin}/auth/auth-code-error`);
    }
  }

  console.error("Auth callback error: No authorization code provided.");
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
