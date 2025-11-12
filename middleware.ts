import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name, options) {
          response.cookies.set({ name, value: "", ...options, maxAge: 0 });
        },
      },
    }
  );

  await supabase.auth.getSession();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const publicPaths = [
    "/",
    "/sign-in",
    "/sign-up",
    "/api/auth/callback",
    "/verify-otp",
    "/forgot-password",
    "/update-password",
  ];

  if (!user) {
    if (publicPaths.includes(pathname) || pathname === "/create-profile") {
      return response;
    }
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // --- THE CRITICAL FIX ---
  // If the user is authenticated (even with a temporary password reset token)
  // and they are on the update-password page, DO NOT redirect them.
  // This allows the password update form to handle the session.
  if (pathname === "/update-password") {
    return response;
  }
  // --- END OF FIX ---

  // --- Handle Authenticated Users ---
  const { data: studentProfile } = await supabase
    .from("student_profiles")
    .select("role, profile_status")
    .eq("user_id", user.id)
    .single();
  const { data: companyProfile } = await supabase
    .from("company_profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();
  const userRole = studentProfile?.role || companyProfile?.role;
  const isStudentProfileComplete =
    studentProfile?.profile_status === "complete";

  if (userRole === "student" && !isStudentProfileComplete) {
    if (pathname !== "/create-profile") {
      return NextResponse.redirect(new URL("/create-profile", request.url));
    }
    return response;
  }

  if (publicPaths.includes(pathname) || pathname === "/create-profile") {
    if (userRole === "company") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname.startsWith("/admin") && userRole !== "company") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  const studentPaths = [
    "/dashboard",
    "/profile-settings",
    "/upload-resume",
    "/applied-internships",
    "/track-progress",
    "/chat",
  ];
  if (
    studentPaths.some((p) => pathname.startsWith(p)) &&
    userRole !== "student"
  ) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
