// app/api/auth/callback/route.ts

import { supabaseAdmin } from "@/lib/supabase/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name, value, options) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name, options) {
            cookieStore.set({ name, value: "", ...options });
          },
        },
      }
    );

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
          return NextResponse.redirect(`${origin}/dashboard`);
        }

        if (!studentProfile) {
          console.log(
            `New student via OAuth: ${user.email}. Creating profile.`
          );
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
