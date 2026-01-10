import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isUUID } from "@/lib/utils";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const cookieStore = await cookies();

    if (!id) {
        return NextResponse.json(
            { error: "program ID is required" },
            { status: 400 }
        );
    }

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get: (name: string) => {
                    return cookieStore.get(name)?.value;
                },
            },
        }
    );

    try {
        const isIdUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

        let query = supabase
            .from("programs")
            .select('*, company:company_profiles (id, company_name, logo_url)');

        if (isIdUUID) {
            query = query.eq("id", id);
        } else {
            query = query.ilike("title", id.replace(/-/g, ' '));
        }

        const { data: program, error } = await query.maybeSingle();

        if (error) {
            console.error("Supabase query error:", error);
            return NextResponse.json(
                { error: "Failed to fetch program" },
                { status: 500 }
            );
        }

        if (!program) {
            return NextResponse.json(
                { error: "program not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(program);
    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json(
            { error: "An unexpected error occurred" },
            { status: 500 }
        );
    }
}
