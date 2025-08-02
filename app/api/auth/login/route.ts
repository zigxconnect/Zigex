import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 }
    );
  }

  const cookieStore = cookies();
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

  // 1. Attempt to sign the user in.
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 }
    );
  }

  // 2. THE FIX IS HERE: Check the reliable 'profile_status' field.
  const { data: profile } = await supabase
    .from("student_profiles")
    .select("profile_status") // Select the new status field
    .eq("user_id", data.user.id)
    .single();

  // 3. Return a response indicating if the profile is complete.
  return NextResponse.json(
    {
      message: "Login successful",
      // The logic is now explicit: is the status 'complete'?
      profileComplete: profile?.profile_status === "complete",
    },
    { status: 200 }
  );
}
