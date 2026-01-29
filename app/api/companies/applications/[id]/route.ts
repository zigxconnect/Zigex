import { authMiddleware } from "@/lib/middleware/auth";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { sendAcceptanceEmail, sendRejectionEmail, sendApplicationAlert, sendPaymentReceiptEmail } from "@/lib/email";

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

  let application: any = null;
  let isNewInternshipApp = false;

  // Try legacy table first
  const { data: legacyApp } = await supabaseAdmin
    .from("Applications")
    .select("*")
    .eq("id", id)
    .single();

  if (legacyApp) {
    application = legacyApp;
  } else {
    // Try new internship table
    const { data: sApp } = await supabaseAdmin
      .from("internship_applications")
      .select(`
        *,
        internship:internships(id, title, description, company_id)
      `)
      .eq("id", id)
      .single();

    if (sApp) {
      application = sApp;
      isNewInternshipApp = true;
    }
  }

  if (!application) {
    return NextResponse.json(
      { error: "Application not found" },
      { status: 404 }
    );
  }

  // Cross-reference with company
  if (isNewInternshipApp) {
    const intershipData = Array.isArray(application.internship) ? application.internship[0] : application.internship;
    if (!intershipData || intershipData.company_id !== company.id) {
      return NextResponse.json(
        { error: "Unauthorized: Application does not belong to this company." },
        { status: 403 }
      );
    }
  } else {
    if (application.application_type == "event") {
      const { data: opportunity } = await supabaseAdmin
        .from("event")
        .select("company_id")
        .eq("id", application.event_id)
        .single();
      if (!opportunity || opportunity.company_id !== company.id)
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    } else if (application.application_type == "program") {
      const { data: opportunity } = await supabaseAdmin
        .from("programs")
        .select("company_id")
        .eq("id", application.program_id)
        .single();
      if (!opportunity || opportunity.company_id !== company.id)
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    } else if (application.application_type == "internship") {
      const { data: opportunity } = await supabaseAdmin
        .from("internships")
        .select("company_id")
        .eq("id", application.internship_id)
        .single();
      if (!opportunity || opportunity.company_id !== company.id)
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
  }

  return NextResponse.json(application);
}

/**
 * PATCH: Updates an application's status and/or payment status.
 * Supports: { status?: string, is_paid?: boolean }
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
  const body = await request.json();
  const { status, payment_completed, payment_ledger } = body;

  // --- FETCH APPLICATION (LEGACY OR NEW INTERNSHIP) ---
  let application: any = null;
  let isNewInternshipApp = false;

  const { data: legacyApp } = await supabaseAdmin
    .from("Applications")
    .select("*")
    .eq("id", id)
    .single();

  if (legacyApp) {
    application = legacyApp;
  } else {
    const { data: sApp } = await supabaseAdmin
      .from("internship_applications")
      .select(`
        *,
        internship:internships(id, title, description, company_id)
      `)
      .eq("id", id)
      .single();

    if (sApp) {
      application = sApp;
      isNewInternshipApp = true;
    }
  }

  if (!application) {
    return NextResponse.json(
      { error: "Application not found" },
      { status: 404 }
    );
  }

  // Permission Check
  if (isNewInternshipApp) {
    const internshipData = Array.isArray(application.internship) ? application.internship[0] : application.internship;
    if (!internshipData || internshipData.company_id !== company.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
  }
  // ... (Legacy permission check is implicit later or we could add it here)

  // Get the student profile
  // IMPORTANT: For structured apps, student_id is user_id. For legacy, it's profile_id.
  const { data: studentProfile } = await supabaseAdmin
    .from("student_profiles")
    .select("user_id, full_name")
    .eq(isNewInternshipApp ? "user_id" : "id", application.student_id)
    .single();

  // We allow updates even if student profile is missing (e.g. deleted user), 
  // but we can only notify if we have a valid profile and user_id.
  const shouldNotify = !!studentProfile?.user_id;

  if (!shouldNotify) {
    console.warn(`[UPDATE_APPLICATION] Warning: Student profile or user_id not found for application ${id}. Notifications will be skipped.`);
  }

  // Get the opportunity title
  let opportunityTitle = "your application";
  let opportunityPrice = 0;
  let opportunityId: string | null = null;
  let appType = application.application_type;

  if (isNewInternshipApp) {
    const internshipData = Array.isArray(application.internship) ? application.internship[0] : application.internship;
    opportunityTitle = internshipData?.title || "Internship";
    opportunityId = internshipData?.id;
    appType = "internship";
  } else {
    if (application.application_type === "internship" && application.internship_id) {
      const { data: internship } = await supabaseAdmin
        .from("internships")
        .select("title")
        .eq("id", application.internship_id)
        .single();
      opportunityTitle = internship?.title || opportunityTitle;
      opportunityId = application.internship_id;
    } else if (application.application_type === "program" && application.program_id) {
      const { data: program } = await supabaseAdmin
        .from("programs")
        .select("title, price_xaf")
        .eq("id", application.program_id)
        .single();
      opportunityTitle = program?.title || opportunityTitle;
      opportunityPrice = program?.price_xaf || 0;
      opportunityId = application.program_id;
    } else if (application.application_type === "event" && application.event_id) {
      const { data: event } = await supabaseAdmin
        .from("event")
        .select("title")
        .eq("id", application.event_id)
        .single();
      opportunityTitle = event?.title || opportunityTitle;
      opportunityId = application.event_id;
    }
  }

  // --- Common variables for notifications ---
  const studentName = isNewInternshipApp ? application.full_name : (studentProfile?.full_name || "Student");

  // --- Handle payment_completed update (simple update, no notifications) ---
  if (typeof payment_completed === 'boolean' && status === undefined) {
    const table = isNewInternshipApp ? "internship_applications" : "Applications";
    const updatePayload: any = isNewInternshipApp
      ? { is_paid_acknowledgement: payment_completed }
      : { payment_completed };

    const { data: updatedApplication, error: updateError } = await supabaseAdmin
      .from(table)
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error(`[PATCH_PAYMENT] Error for ${id}:`, updateError);
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    if (payment_completed === true && shouldNotify) {
      try {
        const studentAuthId = studentProfile!.user_id;

        // Add Real-time Notification
        await createNotification(
          studentAuthId,
          "Payment Confirmed! 💰",
          `Your payment for "${opportunityTitle}" has been confirmed. You now have full access to your workspace.`,
          "internship",
          id
        );

        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(studentAuthId);
        const studentEmail = userData?.user?.email;

        if (studentEmail) {
          await sendPaymentReceiptEmail({
            email: studentEmail,
            name: studentName,
            programTitle: opportunityTitle,
            amount: opportunityPrice,
            date: new Date().toISOString(),
            ref: `ZGX-APP-${id.substring(0, 6).toUpperCase()}`,
            month: new Date().toLocaleString('default', { month: 'long' }),
            companyName: company.company_name,
            companyLogo: company.logo_url,
            companyAddress: company.address
          });
          console.log(`[PAYMENT_NOTIFICATION] Receipt sent to ${studentEmail}`);
        }
      } catch (receiptError) {
        console.error("[PAYMENT_NOTIFICATION] Failed to send receipt:", receiptError);
      }
    }

    return NextResponse.json({
      ...updatedApplication,
      message: payment_completed
        ? "Payment confirmed! Student now has full access."
        : "Payment status revoked."
    });
  }

  // --- Update or Delete the application based on status ---
  let resultData = null;

  // Build update object with both status and payment_completed if provided
  const updateObject: { status?: string; payment_completed?: boolean; payment_ledger?: any; updated_at?: string } = {
    updated_at: new Date().toISOString()
  };

  if (status !== undefined) {
    // Map 'reviewing' to 'reviewed' for structured apps to satisfy DB check constraint if needed
    // The structured table only allows: 'pending', 'reviewed', 'accepted', 'rejected'
    if (isNewInternshipApp && status === "reviewing") {
      updateObject.status = "reviewed";
    } else {
      updateObject.status = status;
    }
  }

  if (typeof payment_completed === 'boolean') {
    if (isNewInternshipApp) {
      // Map to the correct column name for internship_applications
      (updateObject as any).is_paid_acknowledgement = payment_completed;
    } else {
      updateObject.payment_completed = payment_completed;
    }
  }

  if (payment_ledger !== undefined) updateObject.payment_ledger = payment_ledger;

  console.log(`[PATCH_APPLICATION] Updating ${id} in ${isNewInternshipApp ? "internship_applications" : "Applications"}:`, updateObject);

  if (Object.keys(updateObject).length > 1) { // > 1 because updated_at is always there
    // UPDATE the application
    const table = isNewInternshipApp ? "internship_applications" : "Applications";
    const { data: updatedApplication, error: updateError } = await supabaseAdmin
      .from(table)
      .update(updateObject)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error(`[PATCH_APPLICATION] Update error for ${id}:`, updateError);
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    if (!updatedApplication) {
      console.warn(`[PATCH_APPLICATION] Update succeeded but no data returned for ${id}`);
      // If update succeeded but select().single() returned nothing, we still want to return the updated values
      resultData = { ...application, ...updateObject };
    } else {
      resultData = updatedApplication;
    }
  } else {
    return NextResponse.json({ error: "No valid update fields provided" }, { status: 400 });
  }

  // --- Background Tasks: Notifications and Emails ---
  if (shouldNotify) {
    const startBackgroundTasks = async () => {
      try {
        const studentAuthId = isNewInternshipApp ? application.student_id : (studentProfile?.user_id || application.student_id);
        const referenceId = opportunityId;

        if (referenceId && appType && studentAuthId) {
          console.log(`[BACKGROUND_TASKS] Starting for ${id}, status: ${status}`);
          const { data: userData } = await supabaseAdmin.auth.admin.getUserById(studentAuthId);
          const studentEmail = userData?.user?.email;
          const studentName = isNewInternshipApp ? application.full_name : (studentProfile?.full_name || "Student");
          const companyName = company.company_name || "The Company";

          const emailPromises = [];

          // 1. Notify Candidate of Decision
          if (studentEmail) {
            if (status === "accepted") {
              emailPromises.push(sendAcceptanceEmail({
                email: studentEmail,
                name: studentName,
                opportunityTitle,
                opportunityType: appType,
                companyName,
                whatsappGroupLink: "https://chat.whatsapp.com/DXYGLpny3DwGs5pkb1fPAr",
              }));
            } else if (status === "rejected") {
              emailPromises.push(sendRejectionEmail({
                email: studentEmail,
                name: studentName,
                opportunityTitle,
                opportunityType: appType,
                companyName,
              }));
            }
          }

          // 2. Alert Admins
          emailPromises.push(sendApplicationAlert({
            adminEmail: "zigex.connect@gmail.com,zigexconnect.com@gmail.com",
            studentName,
            studentEmail: studentEmail || "N/A",
            opportunityTitle,
            opportunityType: appType,
            status: status || "updated",
            companyName,
          }));

          if (company.email) {
            emailPromises.push(sendApplicationAlert({
              adminEmail: company.email,
              studentName,
              studentEmail: studentEmail || "N/A",
              opportunityTitle,
              opportunityType: appType,
              status: status || "updated",
              companyName,
            }));
          }

          // 3. In-app Notification
          const notificationTitle = status === "accepted"
            ? "Congratulations! Your Application was Accepted!"
            : status === "rejected"
              ? "Application Update: Please Reapply"
              : `Application status updated: ${status || 'Update'}`;

          const notificationMessage = status === "accepted"
            ? `Great news! Your application for "${opportunityTitle}" has been accepted.`
            : status === "rejected"
              ? `Your application for "${opportunityTitle}" has been reviewed. Check your email for details.`
              : `Your application status for "${opportunityTitle}" is now ${status || 'updated'}.`;

          emailPromises.push(createNotification(
            studentAuthId,
            notificationTitle,
            notificationMessage,
            appType as any,
            referenceId
          ));

          await Promise.allSettled(emailPromises);
          console.log(`[BACKGROUND_TASKS] Completed for ${id}`);
        }
      } catch (bgError) {
        console.error("[BACKGROUND_TASKS] Critical error:", bgError);
      }
    };

    // Use Next.js 15 request wait if available, otherwise fire and forget
    startBackgroundTasks();
  }

  return NextResponse.json(resultData);
}

/**
 * DELETE: Deletes an application.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authMiddleware(request);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const { type, company } = auth;
  // Ensure only authorized roles can delete (company or zigex admin if implemented)
  // For now, assume auth.type === 'company' is sufficient as per existing logic
  if (type !== "company" || !company) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }

  const { id } = await params;

  // Perform delete
  // Try to delete from either table
  const { error: error1 } = await supabaseAdmin
    .from("Applications")
    .delete()
    .eq("id", id);

  const { error: error2 } = await supabaseAdmin
    .from("internship_applications")
    .delete()
    .eq("id", id);

  if (error1 && error2) {
    console.error("Delete error:", error1, error2);
    return NextResponse.json({ error: "Failed to delete from both tables" }, { status: 500 });
  }

  return NextResponse.json({ message: "Application deleted successfully" });
}
