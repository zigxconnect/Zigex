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
        payment_completed,
        program_id,
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

    // --- FETCH FROM LEGACY APPLICATIONS TABLE ---
    const { data: legacyApps, error: legacyError } = await supabaseAdmin
      .from("Applications")
      .select(selectString)
      .eq("company_id", company.id)
      .order("created_at", { ascending: false });

    if (legacyError) throw legacyError;

    // --- FETCH FROM NEW INTERNSHIP_APPLICATIONS TABLE ---
    // First, get all internship IDs for this company
    const { data: companyInternships, error: internshipIdsError } = await supabaseAdmin
      .from("internships")
      .select("id")
      .eq("company_id", company.id);

    if (internshipIdsError) throw internshipIdsError;
    const internshipIds = companyInternships?.map(i => i.id) || [];

    let structuredInternshipApps: any[] = [];
    if (internshipIds.length > 0) {
      const { data: sApps, error: sError } = await supabaseAdmin
        .from("internship_applications")
        .select(`
          *,
          internship:internships(id, title, description),
          student:student_profiles(id, user_id, full_name, avatar_url, email, phone)
        `)
        .in("internship_id", internshipIds)
        .order("created_at", { ascending: false });

      if (sError) throw sError;
      structuredInternshipApps = sApps || [];
    }

    // Collect user_ids that need auth email lookup
    const userIdsNeedingEmail: string[] = [];
    [...(legacyApps || []), ...structuredInternshipApps].forEach((app: any) => {
      const student = Array.isArray(app.student) ? app.student[0] : app.student;
      if (student && !student.email && student.user_id) {
        userIdsNeedingEmail.push(student.user_id);
      }
    });

    // Batch fetch auth emails
    const authEmailMap: Record<string, string> = {};
    if (userIdsNeedingEmail.length > 0) {
      await Promise.all(
        userIdsNeedingEmail.map(async (userId) => {
          try {
            const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
            if (userData?.user?.email) authEmailMap[userId] = userData.user.email;
          } catch (e) {
            console.error(`Failed to fetch auth email for ${userId}:`, e);
          }
        })
      );
    }

    // Format Legacy Applications
    const formattedLegacy: Applicant[] = (legacyApps || []).map((app: any) => {
      const student = Array.isArray(app.student) ? app.student[0] : app.student;
      const internship = Array.isArray(app.internship) ? app.internship[0] : app.internship;
      const program = Array.isArray(app.program) ? app.program[0] : app.program;
      const event = Array.isArray(app.event) ? app.event[0] : app.event;
      const opportunity = internship || program || event;

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
        applicationType: app.application_type,
        duration: app.duration,
        department: app.department,
        workMode: app.work_mode,
        level: app.level,
        expectations: app.expectations,
        comments: app.comments,
        rsvpStatus: app.rsvp_status,
        studentId: student?.id,
        userId: student?.user_id,
        isPaid: app.payment_completed || app.is_paid || false,
        programId: app.program_id || null,
      };
    });

    // Format Structured Internship Applications
    const formattedStructured: Applicant[] = structuredInternshipApps.map((app: any) => {
      const student = Array.isArray(app.student) ? app.student[0] : app.student;
      const internship = Array.isArray(app.internship) ? app.internship[0] : app.internship;

      let email = student?.email;
      if (!email && student?.user_id && authEmailMap[student.user_id]) {
        email = authEmailMap[student.user_id];
      }

      return {
        id: app.id,
        name: app.full_name || student?.full_name || "N/A",
        avatarUrl: student?.avatar_url || `/default-avatar.svg`,
        email: email || "No email",
        phone: student?.phone || "No phone",
        internshipTitle: internship?.title || "Internship",
        internshipId: internship?.id,
        opportunityDescription: internship?.description || "",
        appliedDate: app.created_at,
        status: app.status as any,
        resumeUrl: null, // Structured form doesn't have resume yet
        coverLetter: null,
        applicationType: "internship",
        duration: app.duration,
        school: app.school,
        schoolLevel: app.school_level,
        dateOfBirth: app.date_of_birth,
        address: app.address,
        domain: app.domain,
        experienceLevel: app.experience_level,
        reason: app.reason,
        expectations: app.expectations,
        comments: app.comment,
        studentId: student?.id,
        userId: app.student_id,
        isPaid: app.is_paid_acknowledgement, // this indicates they acknowledged payment terms
      };
    });

    // Combine and Sort by date
    const allApplicants = [...formattedLegacy, ...formattedStructured].sort(
      (a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime()
    );

    return NextResponse.json(allApplicants);
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "An internal server error occurred.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
