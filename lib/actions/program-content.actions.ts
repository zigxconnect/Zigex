import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { unstable_cache } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/server";

// Cached function to get program content
// Uses admin client to bypass RLS and avoid cookie dependency in cache
export const getProgramContentCached = unstable_cache(
    async (programId: string) => {
        const { data: content, error } = await supabaseAdmin
            .from("program_content")
            .select("*")
            .eq("program_id", programId)
            .order("display_order", { ascending: true });

        if (error) {
            console.error("Error fetching program content:", error);
            return [];
        }

        return content || [];
    },
    ['program-content-by-id'], // Cache Key
    {
        revalidate: 300, // Cache for 5 minutes
        tags: ['program-content']
    }
);

export async function getStudentEnrollment(programId: string, userId: string) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
            },
        }
    );

    // 1. Get student profile
    const { data: studentProfile } = await supabase
        .from("student_profiles")
        .select("id")
        .eq("user_id", userId)
        .single();

    if (!studentProfile) return null;

    // 2. Get application details including program info
    const { data: application } = await supabase
        .from("Applications")
        .select(`
        *,
        program:programs (
          title,
          description,
          program_picture_url,
          company:company_profiles (
             company_name,
             logo_url
          )
        )
      `)
        .eq("program_id", programId)
        .eq("student_id", studentProfile.id)
        .single();

    if (!application) return null;

    // Map to the shape expected by the client
    // Note: application.program is likely an object or array depending on query, usually object if single relation
    // But strictly typed, it might be array. We handle safely.
    const program = Array.isArray(application.program) ? application.program[0] : application.program;
    const company = program?.company;

    return {
        applicationId: application.id,
        programId: application.program_id,
        programTitle: program?.title || "Unknown Program",
        programDescription: program?.description,
        programPictureUrl: program?.program_picture_url,
        status: application.status,
        isPaid: application.payment_completed,
        companyName: company?.company_name || "Company",
        companyLogoUrl: company?.logo_url,
        startDate: application.created_at, // Placeholder if start_date not in application
        endDate: null
    };
}
