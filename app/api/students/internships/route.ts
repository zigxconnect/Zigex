// public internship listing

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
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
    const { data: internships, error } = await supabase
      .from("internships")
      .select(
        `
        id,
        title,
        description,
        required_skills,
        location,
        is_paid,
        created_at,
        company_profiles (
          company_name,
          logo_url 
        )
      `
      )
      // Optional: Order by the newest internships first
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase query error:", error);

      throw error;
    }

    return NextResponse.json(internships, { status: 200 });
  } catch (error: any) {
    console.error("API Endpoint Error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch internships",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
