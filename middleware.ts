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

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  const publicPaths = [
    "/",
    "/sign-in",
    "/sign-up",
    "/company/sign-up",
    "/api/auth/callback",
    "/verify-otp",
    "/forgot-password",
    "/update-password",
    "/demo",
  ];

  // --- 1. Handle Unauthenticated Users ---
  if (!user) {
    if (
      publicPaths.includes(pathname) ||
      pathname === "/create-profile" ||
      pathname === "/profile-complete"
    ) {
      return response;
    }
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // --- 2. Handle Authenticated Users ---

  if (pathname === "/update-password") {
    return response;
  }

  const { data: studentProfile, error: studentError } = await supabase
    .from("student_profiles")
    .select("role, profile_status")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: companyProfile, error: companyError } = await supabase
    .from("company_profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  // Log any errors for debugging
  if (studentError) {
    console.error("[Middleware] Error fetching student profile:", studentError);
  }
  if (companyError) {
    console.error("[Middleware] Error fetching company profile:", companyError);
  }

  // Determine user role, or mark as "unassigned" if neither profile exists
  let userRole: "student" | "company" | "unassigned" = "unassigned";
  if (studentProfile?.role === "student") {
    userRole = "student";
  } else if (companyProfile?.role === "company") {
    userRole = "company";
  }

  const isStudentProfileComplete =
    studentProfile?.profile_status === "complete";

  // --- 3. Handle Unassigned Users (No Profile Yet) ---
  if (userRole === "unassigned") {
    if (pathname !== "/create-profile" && pathname !== "/company/sign-up") {
      return NextResponse.redirect(new URL("/create-profile", request.url));
    }
    return response;
  }

  // --- 4. Enforce Profile Creation for Students ---
  if (userRole === "student" && !isStudentProfileComplete) {
    if (pathname !== "/create-profile") {
      return NextResponse.redirect(new URL("/create-profile", request.url));
    }
    return response;
  }

  // --- 5. Redirect Authenticated Users from Restricted Pages ---

  // --- THE FIX ---
  // Create a list of all pages an authenticated and fully set-up user should NOT be able to access.
  const authRedirectPaths = [
    ...publicPaths.filter((path) => path !== "/demo"),
    "/create-profile",
    "/profile-complete", // Added the new page here
  ];

  // If the user is on any of these restricted pages, redirect them to their dashboard.
  if (authRedirectPaths.includes(pathname)) {
    if (userRole === "company") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    if (userRole === "student") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }
  // --- END OF FIX ---

  // --- 6. Role-Based Authorization ---
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
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
