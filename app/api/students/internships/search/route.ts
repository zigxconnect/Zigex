import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const { searchParams } = new URL(request.url);
  const searchQuery = searchParams.get("q");

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
    // Start building the query
    let query = supabase.from("internships").select(`
          id,
          title,
          location,
          type,
          category,
          company_profiles (
            company_name,
            logo_url,
            headQuarterImage
          )
        `);

    // THE FIX IS HERE: If there is a search query, add filters.
    if (searchQuery) {
      // Use `or` to search in multiple columns.
      // `ilike` is a case-insensitive "contains" search.
      query = query.or(
        `title.ilike.%${searchQuery}%,` +
          `description.ilike.%${searchQuery}%,` +
          `required_skills.ilike.%${searchQuery}%,` +
          `company_profiles.company_name.ilike.%${searchQuery}%`
      );
    }

    // Always order the results
    query = query.order("created_at", { ascending: false });

    // Execute the final query
    const { data: internships, error } = await query;

    if (error) {
      console.error("Supabase query error:", error);
      throw error;
    }

    return NextResponse.json(internships || [], { status: 200 });
  } catch (error: any) {
    console.error("API Endpoint Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch internships", details: error.message },
      { status: 500 }
    );
  }
}
