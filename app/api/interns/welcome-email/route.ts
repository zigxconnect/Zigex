import { authMiddleware } from "@/lib/middleware/auth";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(request: Request) {
  const auth = await authMiddleware(request);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const { type, company } = auth;
  if (type !== "company" || !company) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }

  try {
    const { internId, customMessage } = await request.json();

    if (!internId) {
      return NextResponse.json(
        { error: "Intern ID is required" },
        { status: 400 }
      );
    }

    // Get the application and verify it belongs to this company
    const { data: application, error: appError } = await supabaseAdmin
      .from("Applications")
      .select("*, student_profiles(full_name, user_id)")
      .eq("id", internId)
      .eq("status", "accepted")
      .single();

    if (appError || !application) {
      return NextResponse.json(
        { error: "Accepted intern not found" },
        { status: 404 }
      );
    }

    // Get the student's email
    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(
      application.student_profiles.user_id
    );

    const studentEmail = userData?.user?.email;
    if (!studentEmail) {
      return NextResponse.json(
        { error: "Student email not found" },
        { status: 404 }
      );
    }

    // Get internship/program/event title
    let opportunityTitle = "Intern";
    if (application.application_type === "internship" && application.internship_id) {
      const { data: internship } = await supabaseAdmin
        .from("internships")
        .select("title")
        .eq("id", application.internship_id)
        .single();
      opportunityTitle = internship?.title || opportunityTitle;
    } else if (application.application_type === "program" && application.program_id) {
      const { data: program } = await supabaseAdmin
        .from("programs")
        .select("title")
        .eq("id", application.program_id)
        .single();
      opportunityTitle = program?.title || opportunityTitle;
    } else if (application.application_type === "event" && application.event_id) {
      const { data: event } = await supabaseAdmin
        .from("event")
        .select("title")
        .eq("id", application.event_id)
        .single();
      opportunityTitle = event?.title || opportunityTitle;
    }

    // Send the welcome email
    await sendWelcomeEmail({
      email: studentEmail,
      name: application.student_profiles.full_name || "Student",
      opportunityTitle,
      companyName: company.company_name,
      customMessage
    });

    return NextResponse.json({
      success: true,
      message: "Welcome email sent successfully"
    });
  } catch (error: any) {
    console.error("Welcome email error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send welcome email" },
      { status: 500 }
    );
  }
}
