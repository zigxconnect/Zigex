import { createClient } from "@/lib/supabase/server";
import { sendPushNotification } from "@/lib/push";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized. Please log in on the site first." }, { status: 401 });
        }

        console.log(`[TEST_PUSH] Triggering test for user: ${user.id}`);
        
        await sendPushNotification(user.id, {
            title: "Zigex Production Test 🚀",
            body: "If you see this, push notifications are working perfectly in production!",
            url: "/"
        });

        return NextResponse.json({ 
            success: true, 
            message: "Test push notification dispatched. Check your device!" 
        });
    } catch (error: any) {
        console.error("[TEST_PUSH] Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
