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


    const { data: events, error } = await supabase
        .from("event")
        .select('*, company:company_profiles (company_name, logo_url)')
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Supabase fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch events" },
            { status: 500 }
        );
    }

    return NextResponse.json(events);

    
    
}
