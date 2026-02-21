import { NextResponse } from "next/server";
import { sendAttendanceReminderEmail } from "@/lib/email";

/**
 * TEST ROUTE: Trigger Attendance Reminder
 * usage: /api/test/attendance-reminder?email=your-email@example.com
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
        return NextResponse.json({ error: "Email parameter is required" }, { status: 400 });
    }

    try {
        console.log(`[TEST] Triggering attendance reminder for ${email}...`);

        // Sample data for testing
        await sendAttendanceReminderEmail({
            email: email,
            name: "Supervisor (Test)",
            interns: [
                { name: "John Doe (Sample)" },
                { name: "Jane Smith (Sample)" },
                { name: "Alex Johnson (Sample)" }
            ],
            dashboardLink: "https://zigexconnect.com/supervisor"
        });

        return NextResponse.json({
            success: true,
            message: `Test attendance reminder sent to ${email}. Check your inbox!`
        });
    } catch (error: any) {
        console.error("[TEST ERROR] Failed to send test email:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
