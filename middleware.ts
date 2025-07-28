import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

/**
 * This middleware function runs on every request to the routes specified in `config.matcher`.
 * Its purpose is to protect all student-facing dashboard and profile pages.
 */
export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  // Create a Supabase client that can be used in the middleware.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // 1. Check for an authenticated user.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If there is no user, redirect them to the sign-in page immediately.
  if (!user) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // 2. If the user is authenticated, check their profile status.
  const { data: profile } = await supabase
    .from("student_profiles")
    .select("profile_status") // We use our reliable status field.
    .eq("user_id", user.id)
    .single();

  const isProfileIncomplete = profile?.profile_status !== "complete";
  const isTryingToAccessMainDashboard =
    request.nextUrl.pathname.startsWith("/dashboard");

  // 3. If their profile is incomplete AND they are trying to access the main dashboard,
  //    force them back to the profile creation page.
  if (isProfileIncomplete && isTryingToAccessMainDashboard) {
    return NextResponse.redirect(new URL("/create-profile", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*", // Protects the main dashboard
    "/create-profile", // Protects the onboarding form
    "/profile-settings", // Protects the settings page
    "/upload-resume", // Protects the resume page
    "/applied-internships", // Protects the applications page
  ],
};
