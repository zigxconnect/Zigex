import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { sendAttendanceReminderEmail } from "@/lib/email";

/**
 * CRON JOB: Attendance Reminder
 * Runs at 3 PM and 9 PM daily (configured via Vercel Cron or similar)
 * 
 * Logic:
 * 1. Fetch all supervisors.
 * 2. For each supervisor, find their assigned interns (accepted applications).
 * 3. Check if attendance has been marked for those interns TODAY.
 * 4. If any intern is missing attendance, send a reminder email to the supervisor.
 */

export async function GET(request: Request) {
    try {
        // 1. Auth check (Simple secret token)
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log("[CRON] Starting Attendance Reminder Job...");
        const today = new Date().toISOString().split('T')[0];

        // 2. Fetch all supervisors
        const { data: supervisors, error: supError } = await supabaseAdmin
            .from("supervisor_profiles")
            .select("id, email, full_name");

        if (supError) throw supError;
        if (!supervisors || supervisors.length === 0) {
            return NextResponse.json({ message: "No supervisors found." });
        }

        let emailsSent = 0;

        // 3. Process each supervisor
        for (const supervisor of supervisors) {
            // Find assigned interns from BOTH tables
            const [structuredApps, legacyApps] = await Promise.all([
                supabaseAdmin
                    .from("internship_applications")
                    .select("id, student_id, student:student_profiles(full_name)")
                    .eq("supervisor_id", supervisor.id)
                    .eq("status", "accepted"),
                supabaseAdmin
                    .from("Applications")
                    .select("id, student_id, student:student_profiles(full_name)")
                    .eq("supervisor_id", supervisor.id)
                    .eq("status", "accepted")
            ]);

            const allApps = [
                ...(structuredApps.data || []),
                ...(legacyApps.data || [])
            ];

            if (allApps.length === 0) continue;

            const internsToRemind = [];

            for (const app of allApps) {
                // Check if attendance exists for today
                const { data: attendance, error: attError } = await supabaseAdmin
                    .from("intern_attendance")
                    .select("id")
                    .eq("student_id", app.student_id)
                    .eq("attendance_date", today)
                    .maybeSingle();

                if (attError) {
                    console.error(`[CRON] Error checking attendance for student ${app.student_id}:`, attError);
                    continue;
                }

                if (!attendance) {
                    // Flatten student profile data
                    const studentProfile = Array.isArray(app.student) ? app.student[0] : app.student;
                    internsToRemind.push({
                        name: studentProfile?.full_name || "Unknown Intern"
                    });
                }
            }

            // 4. Send email if there are interns missing attendance
            if (internsToRemind.length > 0) {
                await sendAttendanceReminderEmail({
                    email: supervisor.email,
                    name: supervisor.full_name,
                    interns: internsToRemind,
                    dashboardLink: "https://zigexconnect.com/supervisor"
                });
                emailsSent++;
            }
        }

        console.log(`[CRON] Attendance Reminder Job finished. Total emails sent: ${emailsSent}`);
        return NextResponse.json({
            success: true,
            message: `Sent ${emailsSent} reminder emails.`,
            date: today
        });

    } catch (error: any) {
        console.error("[CRON] Attendance Reminder Job failed:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
