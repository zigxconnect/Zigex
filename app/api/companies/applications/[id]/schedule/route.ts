import { authMiddleware } from "@/lib/middleware/auth";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { Resend } from "resend";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await authMiddleware(request);
    if (auth instanceof NextResponse) {
        return auth;
    }

    const { type, company } = auth;
    if (type !== "company" || !company) {
        return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const { id } = await params;
    const { date } = await request.json();

    // 1. Get Application & Student info
    let application: any = null;
    let studentProfile: any = null;

    // Try legacy table first
    const { data: legacyApp } = await supabaseAdmin
        .from("Applications")
        .select("*, student:student_profiles(full_name, user_id)")
        .eq("id", id)
        .single();

    if (legacyApp) {
        application = legacyApp;
        studentProfile = legacyApp.student;
    } else {
        // Try new internship table
        const { data: sApp } = await supabaseAdmin
            .from("internship_applications")
            .select(`
                *,
                internship:internships(id, title, description)
            `)
            .eq("id", id)
            .single();

        if (sApp) {
            application = sApp;
            // For new apps, student_id is the user_id
            const { data: profile } = await supabaseAdmin
                .from("student_profiles")
                .select("full_name, user_id")
                .eq("user_id", sApp.student_id)
                .single();

            studentProfile = profile || { full_name: sApp.full_name, user_id: sApp.student_id };
        }
    }

    if (!application) {
        return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (!studentProfile?.user_id) {
        return NextResponse.json({ error: "Student user not found" }, { status: 404 });
    }

    // 2. Get Student Email
    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(studentProfile.user_id);
    const studentEmail = userData?.user?.email;

    if (!studentEmail) {
        return NextResponse.json({ error: "Student email not found" }, { status: 404 });
    }

    // 3. Get Opportunity Title
    let opportunityTitle = "the opportunity";
    if (application.application_type === "internship" || application.internship_id) {
        const internshipId = application.internship_id || (application.internship?.id);
        if (internshipId) {
            const { data: internship } = await supabaseAdmin.from("internships").select("title").eq("id", internshipId).single();
            opportunityTitle = internship?.title || opportunityTitle;
        }
    } else if (application.application_type === "program" && application.program_id) {
        const { data: program } = await supabaseAdmin.from("programs").select("title").eq("id", application.program_id).single();
        opportunityTitle = program?.title || opportunityTitle;
    }

    // 4. Send Email
    if (process.env.RESEND_API_KEY) {
        try {
            const resend = new Resend(process.env.RESEND_API_KEY);
            const { InterviewInvitationEmail } = await import("@/emails/InterviewInvitation");

            await resend.emails.send({
                from: "ZIGEX <notifications@zigexconnect.com>",
                to: studentEmail,
                subject: `Interview Invitation: ${opportunityTitle}`,
                react: InterviewInvitationEmail({
                    studentName: studentProfile.full_name || "Student",
                    opportunityTitle,
                    companyName: company.company_name,
                    interviewDate: date,
                }),
            });

            // 5. Update Status to "reviewed" if it was pending
            if (application.status === "pending") {
                const isNewInternshipApp = !legacyApp;
                const table = isNewInternshipApp ? "internship_applications" : "Applications";
                await supabaseAdmin.from(table).update({
                    status: "reviewed",
                    updated_at: new Date().toISOString()
                }).eq("id", id);
            }

        } catch (err) {
            console.error("Failed to send interview invitation:", err);
            return NextResponse.json({ error: "Email delivery failed" }, { status: 500 });
        }
    }

    return NextResponse.json({ message: "Interview scheduled and invitation sent." });
}
