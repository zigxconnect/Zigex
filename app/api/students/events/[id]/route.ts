import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;

    if (!id) {
        return NextResponse.json(
            { error: "Event ID is required" },
            { status: 400 }
        );
    }

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get: (name: string) => {
                    const cookieStore = cookies();
                    return cookieStore.get(name)?.value;
                },
                set: (name: string, value: string, options: CookieOptions) => {
                    const cookieStore =  cookies();
                    cookieStore.set({ name, value, ...options });
                },
                remove:  (name: string, options: CookieOptions) => {
                    const cookieStore = cookies();
                    cookieStore.set({ name, value: "", ...options });
                },
            },
        }
    );

    try {
        const { data: event, error } = await supabase
            .from("event")
            .select(
                `
        *,
        company:company_profiles (
          company_name,
          logo_url,
          email,
          cover_image_url,
          website_url
        )
      `
            )
            .eq("id", id)
            .single();

        if (error) {
            console.error("Supabase query error:", error);

            return NextResponse.json(
                { error: "Failed to fetch event" },
                { status: 500 }
            );
        }

        if (!event) {
            return NextResponse.json(
                { error: "Event not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(event);
    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json(
            { error: "An unexpected error occurred" },
            { status: 500 }
        );
    }
}
