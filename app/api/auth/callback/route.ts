// app/api/auth/callback/route.ts

import { createSupabaseServerClient, supabaseAdmin } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getURL } from "@/lib/utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // Built from NEXT_PUBLIC_SITE_URL rather than request.url's origin — behind
  // a reverse proxy that doesn't forward the original Host header, that origin
  // resolves to the app's internal address (e.g. localhost) instead of the
  // public domain, sending users to the wrong host after auth.
  const origin = getURL().replace(/\/$/, "");
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

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
          // Leave full_name undefined (never null) when unknown so the
          // insert omits the column entirely and the DB default ('Student')
          // applies — an explicit NULL would violate its NOT NULL constraint.
          const full_name = metadata.full_name || metadata.name || undefined;
          const avatar_url = metadata.avatar_url || metadata.picture || null;

          await supabaseAdmin.from("student_profiles").insert({
            user_id: user.id,
            email: user.email,
            ...(full_name ? { full_name } : {}),
            avatar_url,
            profile_status: "incomplete",
          });
        }

        // If we're on a password recovery flow, prioritize the update-password page
        if (next === "/update-password") {
          return NextResponse.redirect(`${origin}${next}`);
        }

        // Deferred completion: land the user on the dashboard even with an
        // incomplete profile. The dashboard surfaces a dismissible banner
        // prompting them to finish setup at /dashboard/edit-profile.
        return NextResponse.redirect(`${origin}${next}`);
      }
    } catch (err) {
      console.error("Auth callback unexpected error:", err);
      return NextResponse.redirect(`${origin}/auth/auth-code-error`);
    }
  }

  console.error("Auth callback error: No authorization code provided.");
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
