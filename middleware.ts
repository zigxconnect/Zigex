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

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  if (!user) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

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

  // A. Protect Admin Routes
  if (pathname.startsWith("/admin")) {
    if (userRole !== "company") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  const studentProtectedPaths = [
    "/dashboard",
    "/create-profile",
    "/profile-settings",
    "/upload-resume",
    "/applied-internships",
    "/track-progress",
    "/chat",
  ];
  if (studentProtectedPaths.some((p) => pathname.startsWith(p))) {
    if (userRole !== "student") {
      return NextResponse.redirect(new URL("/admin/postings", request.url));
    }

    if (
      studentProfile?.profile_status !== "complete" &&
      pathname.startsWith("/dashboard")
    ) {
      return NextResponse.redirect(new URL("/create-profile", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/create-profile",
    "/profile-settings",
    "/upload-resume",
    "/applied-internships",
    "/track-progress",
    "/chat",

    // Admin (Company) Routes from your sidebar
    "/admin/:path*",
  ],
};
