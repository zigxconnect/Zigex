// API Route: Get student's enrolled programs with payment status
import { createServerClient } from "@supabase/ssr";
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
                set() { },
                remove() { },
            },
        }
    );

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get student profile
    const { data: studentProfile, error: profileError } = await supabase
        .from("student_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    if (profileError || !studentProfile) {
        return NextResponse.json(
            { error: "Student profile not found" },
            { status: 404 }
        );
    }

    // Get enrolled programs (accepted applications for programs ONLY)
    const { data: enrolledPrograms, error: programsError } = await supabase
        .from("Applications")
        .select(`
      id,
      status,
      payment_completed,
      created_at,
      program:programs (
        id,
        title,
        description,
        program_picture_url,
        start_date,
        end_date,
        company:company_profiles (
          id,
          company_name,
          logo_url
        )
      )
    `)
        .eq("student_id", studentProfile.id)
        .eq("application_type", "program")
        .eq("status", "accepted")
        .order("created_at", { ascending: false });

    if (programsError) {
        console.error("Error fetching enrolled programs:", programsError);
        return NextResponse.json(
            { error: programsError.message },
            { status: 500 }
        );
    }

    // Format the response
    const formattedPrograms = (enrolledPrograms || [])
        .filter((app: any) => app.program) // Only include applications with valid programs
        .map((app: any) => {
            const program = Array.isArray(app.program) ? app.program[0] : app.program;
            const company = program?.company
                ? Array.isArray(program.company)
                    ? program.company[0]
                    : program.company
                : null;

            return {
                applicationId: app.id,
                programId: program?.id,
                programTitle: program?.title || "Unknown Program",
                programDescription: program?.description,
                programPictureUrl: program?.program_picture_url,
                status: app.status,
                isPaid: app.payment_completed || false,
                paymentCompleted: app.payment_completed || false,
                companyName: company?.company_name || "SEED Inc",
                companyLogoUrl: company?.logo_url,
                startDate: program?.start_date,
                endDate: program?.end_date,
                appliedAt: app.created_at,
            };
        });

    return NextResponse.json(formattedPrograms);
}
