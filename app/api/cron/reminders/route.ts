import { NextResponse } from "next/server";
import { sendSupervisorReminders } from "@/lib/actions/email.actions";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    console.log("[CRON] Email Reminders triggered");

    // Secure the endpoint with a secret key
    const authHeader = request.headers.get('authorization');
    const secret = process.env.CRON_SECRET;

    // Fail-Closed: If secret is not configured or doesn't match, reject immediately
    if (!secret || authHeader !== `Bearer ${secret}`) {
        console.warn("[CRON] Unauthorized or unconfigured attempt to trigger reminders");
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const result = await sendSupervisorReminders();

        // SECURITY: Sanitize the response. Never return individual emails or raw data to the public API.
        return NextResponse.json({
            success: result.success,
            message: result.success ? "Reminders processed successfully" : "Reminders processing failed",
            supervisorsFound: result.count || 0,
            emailsSent: result.successCount || 0,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error("[CRON] Error in reminders route:", error);
        return NextResponse.json({
            success: false,
            error: "Internal Server Error" // Don't leak detailed error messages
        }, { status: 500 });
    }
}
