import { authMiddleware } from "@/lib/middleware/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { Applicant } from "@/lib/types/applicants";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = await authMiddleware(request);
  if (auth instanceof NextResponse) return auth;
  if (auth.type !== "company" || !auth.company) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }
  const { company } = auth;

  try {
    // Fetch ALL application data including form fields
    const selectString = `
        id,
        status,
        resume_url,
        cover_letter_url,
        created_at,
        application_type,
        duration,
        department,
        work_mode,
        level,
        expectations,
        comments,
        rsvp_status,
        student_id,
        internship:internships(id, title, description),
        program:programs(id, title, description),
        event:event(id, title, description),
        student:student_profiles (
          id,
          user_id,
          full_name,
          avatar_url,
          email,
          phone
        )
      `;

    const { data: applications, error } = await supabaseAdmin
      .from("Applications")
      .select(selectString)
      .eq("company_id", company.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase query error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!applications) {
      return NextResponse.json([]);
    }

    // Collect user_ids that need auth email lookup
    const userIdsNeedingEmail: string[] = [];
    applications.forEach((app: any) => {
      const student = Array.isArray(app.student) ? app.student[0] : app.student;
      if (student && !student.email && student.user_id) {
        userIdsNeedingEmail.push(student.user_id);
      }
    });

    // Batch fetch auth emails for users without profile email
    const authEmailMap: Record<string, string> = {};
    if (userIdsNeedingEmail.length > 0) {
      // Use admin API to get user emails from auth.users
      for (const userId of userIdsNeedingEmail) {
        try {
          const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
          if (userData?.user?.email) {
            authEmailMap[userId] = userData.user.email;
          }
        } catch (e) {
          console.error(`Failed to fetch auth email for ${userId}:`, e);
        }
      }
    }

    const formattedApplicants: Applicant[] = applications.map((app: any) => {
      const student = Array.isArray(app.student) ? app.student[0] : app.student;
      const internship = Array.isArray(app.internship) ? app.internship[0] : app.internship;
      const program = Array.isArray(app.program) ? app.program[0] : app.program;
      const event = Array.isArray(app.event) ? app.event[0] : app.event;

      const opportunity = internship || program || event;

      // Get email: First try profile, then try auth lookup
      let email = student?.email;
      if (!email && student?.user_id && authEmailMap[student.user_id]) {
        email = authEmailMap[student.user_id];
      }

      return {
        id: app.id,
        name: student?.full_name || "N/A",
        avatarUrl: student?.avatar_url || `/default-avatar.svg`,
        email: email || "No email",
        phone: student?.phone || "No phone",
        internshipTitle: opportunity?.title || app.application_type || "N/A",
        internshipId: opportunity?.id,
        opportunityDescription: opportunity?.description || "",
        appliedDate: app.created_at,
        status: app.status,
        resumeUrl: app.resume_url,
        coverLetter: app.cover_letter_url,

        // Application Type
        applicationType: app.application_type,

        // Form Fields - Internship
        duration: app.duration,
        department: app.department,
        workMode: app.work_mode,

        // Form Fields - Program/Event
        level: app.level,
        expectations: app.expectations,
        comments: app.comments,

        // Form Fields - Event RSVP
        rsvpStatus: app.rsvp_status,

        // User Info
        studentId: student?.id,
        userId: student?.user_id,
      };
    });

    return NextResponse.json(formattedApplicants);
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "An internal server error occurred.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
