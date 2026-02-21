"use server";

import { resend } from "@/lib/resend";
import { supabaseAdmin } from "@/lib/supabase/server";

/**
 * Sends attendance reminders to all supervisors who have emails.
 */
export async function sendSupervisorReminders() {
    const EMAIL_FROM = process.env.EMAIL_FROM || "onboarding@resend.dev";
    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
        console.error("[REMINDERS] RESEND_API_KEY is missing");
        return { success: false, error: "Email service not configured" };
    }

    try {
        console.log("[REMINDERS] Fetching supervisors...");

        // Fetch supervisors with emails
        const { data: supervisors, error } = await supabaseAdmin
            .from("supervisor_profiles")
            .select("email, full_name")
            .not("email", "is", null);

        if (error) {
            console.error("[REMINDERS] Error fetching supervisors:", error);
            return { success: false, error: error.message };
        }

        if (!supervisors || supervisors.length === 0) {
            console.log("[REMINDERS] No supervisors found with email");
            return { success: true, count: 0 };
        }

        console.log(`[REMINDERS] Sending emails to ${supervisors.length} supervisors...`);

        const results = [];
        for (const supervisor of supervisors) {
            try {
                const { data, error: sendError } = await resend.emails.send({
                    from: `Zigex <${EMAIL_FROM}>`,
                    to: [supervisor.email],
                    subject: "📝 Attendance Reminder",
                    html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h1 style="color: #155DFC;">Time for Attendance!</h1>
                <p>Hello ${supervisor.full_name},</p>
                <p>This is a friendly reminder to take the attendance for your interns today.</p>
                <p>Ensuring accurate records helps us track progress and maintain the quality of our internship program.</p>
                <div style="margin: 30px 0;">
                  <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.zigexconnect.com'}/supervisor" 
                     style="background-color: #155DFC; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    Go to Supervisor Dashboard
                  </a>
                </div>
                <p style="color: #666; font-size: 14px;">Thank you for your dedication to mentoring!</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="color: #999; font-size: 12px;">© ${new Date().getFullYear()} Zigex Connect. All rights reserved.</p>
              </div>
            `,
                });

                if (sendError) {
                    console.error(`[REMINDERS] Failed to send to ${supervisor.email}:`, sendError);
                    results.push({ email: supervisor.email, success: false, error: sendError });
                } else {
                    results.push({ email: supervisor.email, success: true, id: data?.id });
                }

                // Add a 500ms delay to avoid rate limits (Resend free tier is 2 req/sec)
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (err) {
                console.error(`[REMINDERS] Unexpected error sending to ${supervisor.email}:`, err);
                results.push({ email: supervisor.email, success: false });
            }
        }

        const successCount = results.filter(r => r.success).length;
        console.log(`[REMINDERS] Finished. Sent ${successCount}/${supervisors.length} successfully.`);

        return {
            success: true,
            count: supervisors.length,
            successCount,
            results
        };
    } catch (err: any) {
        console.error("[REMINDERS] Critical error:", err);
        return { success: false, error: err.message };
    }
}
