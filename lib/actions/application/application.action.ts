"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import ApplicationStatusEmail from "@/emails/ApplicationStatusEmail";

export async function updateApplicationStatus(applicationId: string, newStatus: string) {
  console.log(`[updateApplicationStatus] Starting update for ${applicationId} to ${newStatus}`);
  const supabase = await createSupabaseServerClient();
  
  try {
    // 1. Fetch application details first to get student and post info
    console.log(`[updateApplicationStatus] Fetching application details...`);
    const { data: application, error: fetchError } = await supabase
      .from("Applications")
      .select(`
        *,
        student_profiles (
          user_id,
          full_name,
          email
        ),
        company_profiles (
          company_name
        ),
        internships (
          title
        ),
        programs (
          title
        ),
        event (
          title
        )
      `)
      .eq("id", applicationId)
      .single();

    if (fetchError || !application) {
      console.error(`[updateApplicationStatus] Error fetching application:`, fetchError);
      throw new Error("Application not found");
    }
    console.log(`[updateApplicationStatus] Application found:`, application.id);

    // 2. Update the status
    console.log(`[updateApplicationStatus] Updating status in DB...`);
    const { error: updateError, count } = await supabase
      .from("Applications")
      .update({ status: newStatus }, { count: 'exact' })
      .eq("id", applicationId);

    if (updateError) {
      console.error(`[updateApplicationStatus] DB Update Error:`, updateError);
      throw updateError;
    }
    
    if (count === 0) {
      console.error(`[updateApplicationStatus] No rows updated. Check RLS policies or ID.`);
      throw new Error("No rows updated");
    }

    console.log(`[updateApplicationStatus] DB Update Successful. Rows updated: ${count}`);

    // 3. Determine post title based on type
    let postTitle = "Position";
    if (application.application_type === "internship") postTitle = application.internships?.title;
    else if (application.application_type === "program") postTitle = application.programs?.title;
    else if (application.application_type === "event") postTitle = application.event?.title;

    // 4. Send Email Notification
    const candidateEmail = application.student_profiles?.email || application.email;

    if (process.env.RESEND_API_KEY && candidateEmail) {
      console.log(`[updateApplicationStatus] Sending email to ${candidateEmail}...`);
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      // Only send emails for significant status changes
      if (["accepted", "rejected", "interview"].includes(newStatus)) {
        try {
          await resend.emails.send({
            from: "FutureProspect <notifications@futureprospect.online>",
            to: candidateEmail,
            subject: `Update on your application: ${postTitle}`,
            react: ApplicationStatusEmail({
              studentName: application.student_profiles?.full_name || "Candidate",
              companyName: application.company_profiles?.company_name || "FutureProspect",
              positionTitle: postTitle,
              status: newStatus as "accepted" | "rejected" | "interview",
            }),
          });
          console.log(`[updateApplicationStatus] Email sent successfully`);
        } catch (emailError) {
          console.error(`[updateApplicationStatus] Email sending failed:`, emailError);
          // Don't throw here, we still want the status update to succeed
        }
      }
    } else {
      console.log(`[updateApplicationStatus] Skipping email. Details:`);
      console.log(`- RESEND_API_KEY present: ${!!process.env.RESEND_API_KEY}`);
      console.log(`- Student Profile Email: ${application.student_profiles?.email}`);
      console.log(`- Application Email: ${application.email}`);
      console.log(`- Resolved Candidate Email: ${candidateEmail}`);
    }

    // 5. Create In-App Notification
    console.log(`[updateApplicationStatus] Creating notification...`);
    const notificationTitle = {
      accepted: "Application Accepted! 🎉",
      rejected: "Application Update",
      interview: "Interview Invitation 📅",
      reviewed: "Application Reviewed",
    }[newStatus] || "Application Update";

    const notificationMessage = {
      accepted: `Congratulations! You've been accepted for ${postTitle}.`,
      rejected: `Update regarding your application for ${postTitle}.`,
      interview: `You have been invited for an interview for ${postTitle}.`,
      reviewed: `Your application for ${postTitle} is now being reviewed.`,
    }[newStatus] || `Your application status for ${postTitle} has changed to ${newStatus}.`;

    const { error: notificationError } = await supabase.from("notifications").insert({
      user_id: application.student_profiles.user_id,
      title: notificationTitle,
      message: notificationMessage,
      type: "application_update",
      reference_id: applicationId,
    });

    if (notificationError) {
      console.error(`[updateApplicationStatus] Notification creation failed:`, notificationError);
    } else {
      console.log(`[updateApplicationStatus] Notification created`);
    }

    revalidatePath("/admin/applications");
    return { success: true };
  } catch (error) {
    console.error("Error updating status:", error);
    return { success: false, error: "Failed to update status" };
  }
}