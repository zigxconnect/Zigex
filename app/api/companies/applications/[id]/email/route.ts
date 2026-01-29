import { authMiddleware } from "@/lib/middleware/auth";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { Resend } from "resend";
import { ZigexApplicationAlertEmail } from "@/emails/ZigexApplicationAlert";

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

    // 1. Get Application & Student
    let application: any = null;
    let studentInfo: any = null;

    // Try legacy first
    const { data: legacyApp } = await supabaseAdmin
        .from("Applications")
        .select("*, student:student_profiles(full_name, user_id)")
        .eq("id", id)
        .single();

    if (legacyApp) {
        application = legacyApp;
        studentInfo = legacyApp.student;
    } else {
        const { data: sApp } = await supabaseAdmin
            .from("internship_applications")
            .select("*")
            .eq("id", id)
            .single();

        if (sApp) {
            application = sApp;
            const { data: profile } = await supabaseAdmin
                .from("student_profiles")
                .select("full_name, user_id")
                .eq("user_id", sApp.student_id)
                .single();
            studentInfo = profile || { full_name: sApp.full_name, user_id: sApp.student_id };
        }
    }

    if (!application) {
        return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (!studentInfo?.user_id) {
        return NextResponse.json({ error: "Student info not found" }, { status: 404 });
    }

    // 2. Get Student Email
    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(
        studentInfo.user_id
    );
    const studentEmail = userData?.user?.email;

    if (!studentEmail) {
        return NextResponse.json({ error: "Student email not found" }, { status: 404 });
    }

    // 3. Send Email via Resend
    if (!process.env.RESEND_API_KEY) {
        return NextResponse.json({ error: "Email service not configured" }, { status: 500 });
    }

    try {
        const resend = new Resend(process.env.RESEND_API_KEY);

        // We'll use the Alert template but for contacting the student
        await resend.emails.send({
            from: "ZIGEX <notifications@zigexconnect.com>",
            to: studentEmail,
            subject: `Follow-up regarding your application at ZIGEX`,
            react: ZigexApplicationAlertEmail({
                studentName: studentInfo.full_name || "Student",
                studentEmail: studentEmail,
                opportunityTitle: "Recruitment Review",
                type: application.application_type || "internship",
            }),
        });

        return NextResponse.json({ message: "Email sent successfully" });
    } catch (error) {
        console.error("Manual email error:", error);
        return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }
}
