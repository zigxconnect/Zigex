import { supabaseAdmin } from "@/lib/supabase/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
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

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error && data?.user) {
        const user = data.user;

        // Fetch existing profile using maybeSingle() so we don't get an error when no row exists
        const { data: studentProfile, error: profileError } =
          await supabaseAdmin
            .from("student_profiles")
            .select("user_id")
            .eq("user_id", user.id)
            .maybeSingle();

        // If no profile exists and there was no db error, create one.
        if (!studentProfile && !profileError) {
          console.log(
            `New user detected with Google OAuth: ${user.email}. Creating student profile.`
          );

          // Safely read user metadata (it may be undefined)
          const metadata = (user.user_metadata || {}) as Record<
            string,
            unknown
          >;
          const full_name =
            typeof metadata["full_name"] === "string"
              ? (metadata["full_name"] as string)
              : typeof metadata["name"] === "string"
                ? (metadata["name"] as string)
                : null;

          const { error: insertError } = await supabaseAdmin
            .from("student_profiles")
            .insert({
              user_id: user.id,
              email: user.email,
              full_name,
              profile_status: "incomplete",
            });

          if (insertError) {
            console.error(
              "Error creating student profile for new Google user:",
              insertError
            );
            return NextResponse.redirect(`${origin}/auth/auth-code-error`);
          }

          // For new users, redirect to the profile creation page.
          return NextResponse.redirect(`${origin}/create-profile`);
        }

        // For existing users, redirect to the dashboard.
        return NextResponse.redirect(`${origin}/dashboard`);
      }
    } catch (err) {
      console.error("Auth callback unexpected error:", err);
      return NextResponse.redirect(`${origin}/auth/auth-code-error`);
    }
  }

  // If there's an error or no code, redirect to an error page.
  console.error("Auth callback error: Could not exchange code for session.");
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
