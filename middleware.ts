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
          // Remove cookie by setting value to empty string, maxAge: 0, and expires to a past date
          response.cookies.set({
            name,
            value: "",
            maxAge: 0,
            expires: new Date(0), // Jan 1, 1970
            ...options,
          });
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
  ];

  // --- 1. Handle Unauthenticated Users ---
  if (!user) {
    // *** THE CRITICAL FIX IS HERE ***
    // Allow access to public paths AND the create-profile page.
    // This breaks the redirect loop after the auth callback.
    if (publicPaths.includes(pathname) || pathname === "/create-profile") {
      return response;
    }

    // For any other protected path, redirect to sign-in
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // --- 2. Handle Authenticated Users ---
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

  // --- A. Force Profile Creation for New Students ---
  if (userRole === "student" && !isStudentProfileComplete) {
    if (pathname !== "/create-profile") {
      return NextResponse.redirect(new URL("/create-profile", request.url));
    }
    return response; // Stay on the create-profile page
  }

  // --- B. Redirect Logged-in Users from Public/Setup Pages ---
  if (publicPaths.includes(pathname) || pathname === "/create-profile") {
    if (userRole === "company") {
      return NextResponse.redirect(new URL("/admin/postings", request.url));
    }
    // This now correctly handles a COMPLETED student trying to access /create-profile
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // --- C. Role-Based Route Protection ---
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
    return NextResponse.redirect(new URL("/admin/postings", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
