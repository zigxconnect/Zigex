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
        const { data: program, error } = await supabase
            .from("programs")
            .select('*')
            .eq("id", id)
            .single();

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
