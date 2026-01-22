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
    const { searchParams } = new URL(request.url);
    const opportunityId = searchParams.get("opportunityId");

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
        payment_ledger,
        program_id,
        internship_id,
        event_id,
        internship:internships(id, title, description, monthly_rate),
        program:programs(id, title, description, price_xaf),
        event:event(id, title, description),
        student:student_profiles (
          id,
          user_id,
          full_name,
          avatar_url,
          phone
        )
      `;


    // --- FETCH FROM LEGACY APPLICATIONS TABLE ---
    let legacyQuery = supabaseAdmin
      .from("Applications")
      .select(selectString)
      .eq("company_id", company.id);

    if (opportunityId) {
      legacyQuery = legacyQuery.or(`internship_id.eq.${opportunityId},program_id.eq.${opportunityId},event_id.eq.${opportunityId}`);
    }

    const { data: legacyApps, error: legacyError } = await legacyQuery.order("created_at", { ascending: false });

    if (legacyError) {
      console.error("[API] Error fetching legacy apps:", legacyError.message);
      // throw legacyError; // Don't throw yet, try structured apps
    }

    // --- FETCH FROM NEW INTERNSHIP_APPLICATIONS TABLE ---
    let structuredInternshipApps: any[] = [];
    try {
      // First, get all internship IDs for this company
      let internshipIdsQuery = supabaseAdmin
        .from("internships")
        .select("id")
        .eq("company_id", company.id);

      if (opportunityId) {
        internshipIdsQuery = internshipIdsQuery.eq("id", opportunityId);
      }

      const { data: companyInternships, error: internshipIdsError } = await internshipIdsQuery;

      if (!internshipIdsError && companyInternships) {
        const internshipIds = companyInternships.map(i => i.id);

        if (internshipIds.length > 0) {
          // Note: student_profiles might not have a direct FK relationship in Supabase for this join
          // We'll fetch them separately if needed, but attempt basic join first
          const { data: sApps, error: sError } = await supabaseAdmin
            .from("internship_applications")
            .select(`
              *,
              internship:internships(id, title, description)
            `)
            .in("internship_id", internshipIds)
            .order("created_at", { ascending: false });

          if (!sError && sApps) {
            structuredInternshipApps = sApps;

            // Manually fetch student profiles for these apps since direct join might fail due to FK constraints
            const studentIds = [...new Set(sApps.map(a => a.student_id))];
            if (studentIds.length > 0) {
              const { data: profiles } = await supabaseAdmin
                .from("student_profiles")
                .select("id, user_id, full_name, avatar_url, phone")
                .in("user_id", studentIds);

              if (profiles) {
                structuredInternshipApps = sApps.map(app => ({
                  ...app,
                  student: profiles.find(p => p.user_id === app.student_id)
                }));
              }
            }
          } else if (sError) {
            console.log("[API] internship_applications table query failure:", sError.message);
          }
        }
      }
    } catch (e) {
      console.log("[API] internship_applications lookup skipped:", e);
    }


    // Collect user_ids that need auth email lookup
    const userIdsNeedingEmail: string[] = [];
    [...(legacyApps || []), ...structuredInternshipApps].forEach((app: any) => {
      const student = Array.isArray(app.student) ? app.student[0] : app.student;
      // We need email from auth for both legacy and structured
      if (student?.user_id) {
        userIdsNeedingEmail.push(student.user_id);
      } else if (app.student_id && !student) {
        // For structured apps where profile might be missing
        userIdsNeedingEmail.push(app.student_id);
      }
    });

    // Batch fetch auth emails
    const authEmailMap: Record<string, string> = {};
    if (userIdsNeedingEmail.length > 0) {
      const uniqueUserIds = [...new Set(userIdsNeedingEmail)];
      await Promise.all(
        uniqueUserIds.map(async (userId) => {
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

      // Robust email lookup
      const email = student?.email || authEmailMap[app.student_id] || authEmailMap[student?.user_id] || "No email";

      // Determine application type based on IDs if not explicitly set
      let applicationType = app.application_type;
      if (!applicationType) {
        if (app.internship_id || internship) applicationType = "internship";
        else if (app.program_id || program) applicationType = "program";
        else if (app.event_id || event) applicationType = "event";
      }

      return {
        id: app.id,
        name: student?.full_name || "N/A",
        avatarUrl: student?.avatar_url || `/default-avatar.svg`,
        email: email,
        phone: student?.phone || "No phone",
        internshipTitle: opportunity?.title || app.application_type || "N/A",
        internshipId: internship?.id || app.internship_id || opportunity?.id,
        opportunityDescription: opportunity?.description || "",
        appliedDate: app.created_at,
        status: app.status,
        resumeUrl: app.resume_url,
        coverLetter: app.cover_letter_url,
        applicationType: applicationType,
        duration: app.duration,
        department: app.department,
        workMode: app.work_mode,
        level: app.level,
        expectations: app.expectations,
        comments: app.comments,
        rsvpStatus: app.rsvp_status,
        studentId: student?.id,
        userId: student?.user_id || app.student_id,
        isPaid: app.payment_completed || app.is_paid || false,
        monthlyRate: internship?.monthly_rate || program?.price_xaf || 0,
        paymentLedger: app.payment_ledger || [],
        programId: app.program_id || null,
      };

    });

    // Format Structured Internship Applications
    const formattedStructured: Applicant[] = structuredInternshipApps.map((app: any) => {
      const student = Array.isArray(app.student) ? app.student[0] : app.student;
      const internship = Array.isArray(app.internship) ? app.internship[0] : app.internship;

      // Robust email lookup
      const email = student?.email || authEmailMap[app.student_id] || authEmailMap[student?.user_id] || "No email";

      return {
        id: app.id,
        name: app.full_name || student?.full_name || "N/A",
        avatarUrl: student?.avatar_url || `/default-avatar.svg`,
        email: email,
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
        userId: app.student_id || student?.user_id,
        isPaid: app.is_paid_acknowledgement, // this indicates they acknowledged payment terms
        monthlyRate: internship?.monthly_rate || 0,
        paymentLedger: app.payment_ledger || [],
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
