import { authMiddleware } from "@/lib/middleware/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { Applicant } from "@/lib/types/applicants"; // Assuming this type is defined elsewhere
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = await authMiddleware(request);
  if (auth instanceof NextResponse) return auth;
  if (auth.type !== "company" || !auth.company) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }
  const { company } = auth;

  try {
    // With company_id on the Applications table, our query becomes incredibly simple.
    // We no longer need to fetch posting IDs first.
    const selectString = `
        id,
        status,
        resume_url,
        cover_letter_url,
        created_at,
        application_type,
        internship:internships(id, title),
        program:programs(id, title),
        event:event(id, title),
        student:student_profiles (
          full_name,
          avatar_url,
          email,
          phone
        )
      `;

    const { data: applications, error } = await supabaseAdmin
      .from("Applications") // Make sure this table name is cased correctly
      .select(selectString)
      .eq("company_id", company.id) // This is the new, efficient filter
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase query error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!applications) {
      return NextResponse.json([]);
    }

    // This local type helps with formatting the data
    type ApplicationRow = (typeof applications)[0];

    const formattedApplicants: Applicant[] = applications.map(
      (app: ApplicationRow) => {
        const opportunity = app.internship || app.program || app.event;

        return {
          id: app.id,
          name: app.student?.full_name || "N/A",
          avatarUrl:
            app.student?.avatar_url || `/default-avatar.svg`,
          email: app.student?.email || "No email",
          phone: app.student?.phone || "No phone",
          internshipTitle: opportunity?.title || app.application_type || "N/A",
          internshipId: opportunity?.id,
          appliedDate: app.created_at,
          status: app.status,
          resumeUrl: app.resume_url,
          coverLetter: app.cover_letter_url,
        };
      }
    );

    return NextResponse.json(formattedApplicants);
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "An internal server error occurred.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
