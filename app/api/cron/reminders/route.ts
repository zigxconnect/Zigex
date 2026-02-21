import { NextResponse } from "next/server";
import { sendSupervisorReminders } from "@/lib/actions/email.actions";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    console.log("[CRON] Email Reminders triggered");

    // Secure the endpoint with a secret key
    const authHeader = request.headers.get('authorization');
    const secret = process.env.CRON_SECRET;

    if (secret && authHeader !== `Bearer ${secret}`) {
        console.warn("[CRON] Unauthorized attempt to trigger reminders");
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const result = await sendSupervisorReminders();
        return NextResponse.json(result);
    } catch (error: any) {
        console.error("[CRON] Error in reminders route:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
