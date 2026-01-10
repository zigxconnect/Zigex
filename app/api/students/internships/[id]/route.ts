import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isUUID } from "@/lib/utils";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: "Internship ID is required" },
      { status: 400 }
    );
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: async (name: string) => {
          const cookieStore = await cookies();
          return cookieStore.get(name)?.value;
        },
        set: async (name: string, value: string, options: CookieOptions) => {
          const cookieStore = await cookies();
          cookieStore.set({ name, value, ...options });
        },
        remove: async (name: string, options: CookieOptions) => {
          const cookieStore = await cookies();
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );

  try {
    const isIdUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    let query = supabase
      .from("internships")
      .select(
        `
        *,
        company_profiles (
          id,
          company_name,
          logo_url,
          email,
          cover_image_url,
          website_url
        )
      `
      );

    if (isIdUUID) {
      query = query.eq("id", id);
    } else {
      query = query.ilike("title", id.replace(/-/g, ' '));
    }

    const { data: internship, error } = await query.maybeSingle();

    if (error || !internship) {
      console.error("Supabase query error:", error);

      return NextResponse.json(
        { error: `Internship with ID ${id} not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json(internship, { status: 200 });
  } catch (error: any) {
    console.error("API Endpoint Error:", error);
    const isProd = process.env.NODE_ENV === "production";
    return NextResponse.json(
      isProd
        ? { error: "Failed to fetch internship details" }
        : {
          error: "Failed to fetch internship details",
          details: error instanceof Error ? error.message : String(error),
        },
      { status: 500 }
    );
  }
}
