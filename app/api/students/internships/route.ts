import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const cookieStore = cookies();
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
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {}
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {}
        },
      },
    }
  );

  try {
    let internships;
    let error;

    if (searchQuery) {
      const { data, error: rpcError } = await supabase.rpc(
        "search_internships",
        {
          search_term: searchQuery,
        }
      );
      internships = data;
      error = rpcError;
    } else {
      const { data, error: fetchError } = await supabase
        .from("internships")
        .select(
          `
        id,
        title,
        location,
        type,
        category,
        company_profiles (
          company_name,
          logo_url,
          cover_image_url 
        )
      `
        )
        .order("created_at", { ascending: false });
      internships = data;
      error = fetchError;
    }

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
