// single internship operation

// File: app/api/internships/[id]/route.ts

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// The GET function now accepts a 'params' object to access the dynamic [id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // 1. Get the specific internship ID from the URL
  const { id } = params;

  if (!id) {
    return NextResponse.json(
      { error: "Internship ID is required" },
      { status: 400 }
    );
  }

  const cookieStore = await cookies();

  // 2. Create the Supabase client
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
    // 3. Fetch the single internship that matches the ID.
    // We are also joining with 'company_profiles' to get extended company details.
    const { data: internship, error } = await supabase
      .from("internships")
      .select(
        `
        *,
        company_profiles (
          company_name,
          logo_url,
          email,
          cover_image_url,
          website_url
        )
      `
      )
      .eq("id", id) // Filter by the ID from the URL
      .single(); // Expect only one result

    if (error) {
      console.error("Supabase query error:", error);

      return NextResponse.json(
        { error: `Internship with ID ${id} not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json(internship, { status: 200 });
  } catch (error: any) {
    console.error("API Endpoint Error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch internship details",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
