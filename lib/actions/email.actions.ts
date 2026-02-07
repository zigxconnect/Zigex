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

        // Fetch supervisors with emails. Include joined date to filter if needed.
        const { data: supervisors, error } = await supabaseAdmin
            .from("supervisor_profiles")
            .select("email, full_name, user_id")
            .not("email", "is", null);

        if (error) {
            console.error("[REMINDERS] Error fetching supervisors:", error);
            return { success: false, error: "Database error" };
        }

        if (!supervisors || supervisors.length === 0) {
            console.log("[REMINDERS] No supervisors found with email");
            return { success: true, count: 0, successCount: 0 };
        }

        console.log(`[REMINDERS] Sending emails to ${supervisors.length} supervisors...`);

        const results = [];
        // Deduplicate emails to prevent sending multiple reminders to the same address
        const seenEmails = new Set<string>();

        for (const supervisor of supervisors) {
            const email = supervisor.email.toLowerCase().trim();
            if (seenEmails.has(email)) continue;
            seenEmails.add(email);

            try {
                const { data, error: sendError } = await resend.emails.send({
                    from: `Zigex <${EMAIL_FROM}>`,
                    to: [email],
                    subject: "📝 Attendance Reminder",
                    html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h1 style="color: #155DFC; margin-bottom: 20px;">Time for Attendance!</h1>
                <p>Hello ${supervisor.full_name},</p>
                <p>This is a friendly reminder to record the attendance for your interns today.</p>
                <p>Ensuring accurate records helps us track progress and maintain the quality of our internship program.</p>
                <div style="margin: 30px 0;">
                  <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.zigexconnect.com'}/supervisor" 
                     style="background-color: #155DFC; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                    Go to Supervisor Dashboard
                  </a>
                </div>
                <p style="color: #666; font-size: 14px;">Thank you for your dedication to mentoring!</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="color: #999; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} Zigex Connect. All rights reserved.</p>
              </div>
            `,
                });

                if (sendError) {
                    console.error(`[REMINDERS] Failed to send to ${email}:`, sendError);
                    results.push({ email, success: false });
                } else {
                    results.push({ email, success: true, id: data?.id });
                }

                // Delay to respect rate limits (2 req/s)
                await new Promise(resolve => setTimeout(resolve, 600));
            } catch (err) {
                console.error(`[REMINDERS] Unexpected error for ${email}:`, err);
                results.push({ email, success: false });
            }
        }

        const successCount = results.filter(r => r.success).length;
        console.log(`[REMINDERS] Broadcast complete. Successful: ${successCount}/${seenEmails.size}`);

        return {
            success: true,
            count: seenEmails.size,
            successCount,
            // Returning minimal info for internal use
        };
    } catch (err: any) {
        console.error("[REMINDERS] Critical broadcast error:", err);
        return { success: false, error: "Internal broadcast error" };
    }
}
