import { authMiddleware } from "@/lib/middleware/auth";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { sendApplicationAcceptedEmail } from "@/lib/mail";

/**
 * Helper function to create a notification for a student.
 * This function matches your specific 'notifications' table schema.
 * @param studentAuthId - The student's ID from the `auth.users` table.
 */
const createNotification = async (
  studentAuthId: string,
  title: string,
  message: string,
  type: "internship" | "program" | "event",
  referenceId: string
) => {
  const { error } = await supabaseAdmin.from("notifications").insert({
    user_id: studentAuthId,
    title,
    message,
    type,
    reference_id: referenceId,
  });
  if (error) {
    console.error("Failed to create notification:", error);
  }
};

/**
 * GET: Fetches a single application's details.
 * This is your existing, working code for this function.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authMiddleware(request);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const { user, type } = auth;
  if (type !== "company") {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }

  const { company } = auth;
  if (!company) {
    return NextResponse.json(
      { error: "Company profile not found" },
      { status: 404 }
    );
  }

  const { id } = await params;

  const { data: application, error: applicationError } = await supabaseAdmin
    .from("Applications")
    .select("*")
    .eq("id", id)
    .single();

  if (applicationError || !application) {
    return NextResponse.json(
      { error: "Application not found" },
      { status: 404 }
    );
  }
  if (application.application_type == "event") {
    const { data: opportunity, error } = await supabaseAdmin
      .from("event")
      .select("company_id")
      .eq("id", application.event_id)
      .single();
    if (error || !opportunity || opportunity.company_id !== company.id)
      return NextResponse.json(
        { error: "Unauthorized: Application does not belong to this company." },
        { status: 403 }
      );
  } else if (application.application_type == "program") {
    const { data: opportunity, error } = await supabaseAdmin
      .from("programs")
      .select("company_id")
      .eq("id", application.program_id)
      .single();
    if (error || !opportunity || opportunity.company_id !== company.id)
      return NextResponse.json(
        { error: "Unauthorized: Application does not belong to this company." },
        { status: 403 }
      );
  } else if (application.application_type == "internship") {
    const { data: opportunity, error } = await supabaseAdmin
      .from("internships")
      .select("company_id")
      .eq("id", application.internship_id)
      .single();
    if (error || !opportunity || opportunity.company_id !== company.id)
      return NextResponse.json(
        { error: "Unauthorized: Application does not belong to this company." },
        { status: 403 }
      );
  }

  return NextResponse.json(application);
}

/**
 * PATCH: Updates an application's status and sends a notification to the student.
 * This version contains the fix for the notification foreign key error.
 */
export async function PATCH(
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
  const { status } = await request.json();

  // First, get the application
  const { data: application, error: applicationError } = await supabaseAdmin
    .from("Applications")
    .select("*")
    .eq("id", id)
    .single();

  if (applicationError || !application) {
    return NextResponse.json(
      { error: "Application not found" },
      { status: 404 }
    );
  }

  // Get the student profile
  const { data: studentProfile } = await supabaseAdmin
    .from("student_profiles")
    .select("user_id, full_name")
    .eq("id", application.student_id)
    .single();

  if (!studentProfile?.user_id) {
    return NextResponse.json(
      { error: "Could not find the student's user authentication ID." },
      { status: 404 }
    );
  }

  // Get the opportunity title based on application type
  let opportunityTitle = "your application";
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

  // --- Update the application status in the database ---
  const { data: updatedApplication, error: updateError } = await supabaseAdmin
    .from("Applications")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    console.log(updateError);
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  // --- Create notification and send email for the student AFTER the update is successful ---
  const referenceId =
    application.internship_id || application.program_id || application.event_id;
  const studentAuthId = studentProfile.user_id;

  if (referenceId && application.application_type) {
    if (status === "accepted") {
      // Send Email
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(
        studentAuthId
      );
      const studentEmail = userData?.user?.email;
      const studentName = studentProfile.full_name || "Student";

      if (studentEmail) {
        await sendApplicationAcceptedEmail(
          studentEmail,
          studentName,
          opportunityTitle,
          application.application_type
        );
      }

      await createNotification(
        studentAuthId,
        "Congratulations! Your Application was Accepted!",
        `Great news! Your application for "${opportunityTitle}" has been accepted.`,
        application.application_type,
        referenceId
      );
    } else if (status === "rejected") {
      await createNotification(
        studentAuthId,
        "Update on Your Application",
        `There is an update regarding your application for "${opportunityTitle}".`,
        application.application_type,
        referenceId
      );
    }
  }

  return NextResponse.json(updatedApplication);
}
