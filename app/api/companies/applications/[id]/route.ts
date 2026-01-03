import { authMiddleware } from "@/lib/middleware/auth";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { sendAcceptanceEmail, sendRejectionEmail, sendApplicationAlert } from "@/lib/email";

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

  // Get the opportunity title and description based on application type
  let opportunityTitle = "your application";
  let opportunityDescription = "";
  if (application.application_type === "internship" && application.internship_id) {
    const { data: internship } = await supabaseAdmin
      .from("internships")
      .select("title, description")
      .eq("id", application.internship_id)
      .single();
    opportunityTitle = internship?.title || opportunityTitle;
    opportunityDescription = internship?.description || "";
  } else if (application.application_type === "program" && application.program_id) {
    const { data: program } = await supabaseAdmin
      .from("programs")
      .select("title, description")
      .eq("id", application.program_id)
      .single();
    opportunityTitle = program?.title || opportunityTitle;
    opportunityDescription = program?.description || "";
  } else if (application.application_type === "event" && application.event_id) {
    const { data: event } = await supabaseAdmin
      .from("event")
      .select("title, description")
      .eq("id", application.event_id)
      .single();
    opportunityTitle = event?.title || opportunityTitle;
    opportunityDescription = event?.description || "";
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

  // --- Create notification and send emails for the student AFTER the update is successful ---
  const referenceId =
    application.internship_id || application.program_id || application.event_id;
  const studentAuthId = studentProfile.user_id;

  if (referenceId && application.application_type) {
    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(
      studentAuthId
    );
    const studentEmail = userData?.user?.email;
    const studentName = studentProfile.full_name || "Student";
    const companyName = company.company_name || "The Company";

    // 1. Notify Candidate of Decision (only for Accepted/Rejected)
    if (studentEmail && status === "accepted") {
      await sendAcceptanceEmail({
        email: studentEmail,
        name: studentName,
        opportunityTitle,
        opportunityType: application.application_type,
        companyName,
        whatsappGroupLink: "https://chat.whatsapp.com/GzXpExampleLink", // Replace with real link
      });
    } else if (studentEmail && status === "rejected") {
      await sendRejectionEmail({
        email: studentEmail,
        name: studentName,
        opportunityTitle,
        opportunityType: application.application_type,
        companyName,
      });
    }

    // 2. Notify Zigex & Company for ANY status update
    await sendApplicationAlert({
      adminEmail: "zigex.connect@gmail.com",
      studentName,
      studentEmail: studentEmail || "N/A",
      opportunityTitle,
      opportunityType: application.application_type,
      status,
      companyName,
    });

    // Also notify company
    if (company.email) {
      await sendApplicationAlert({
        adminEmail: company.email,
        studentName,
        studentEmail: studentEmail || "N/A",
        opportunityTitle,
        opportunityType: application.application_type,
        status,
        companyName,
      });
    }

    // 3. Persistent Database Notification (for candidate dashboard)
    const notificationTitle = status === "accepted"
      ? "Congratulations! Your Application was Accepted!"
      : status === "rejected"
        ? "Update on Your Application"
        : `Application moved to [${status}]`;

    const notificationMessage = status === "accepted"
      ? `Great news! Your application for "${opportunityTitle}" has been accepted.`
      : status === "rejected"
        ? `After review, your application for "${opportunityTitle}" was not selected. Check your email for more details.`
        : `Your application for "${opportunityTitle}" is now ${status}.`;

    await createNotification(
      studentAuthId,
      notificationTitle,
      notificationMessage,
      application.application_type,
      referenceId
    );
  }

  return NextResponse.json(updatedApplication);
}
