"use server";

import { createServerActionClient, supabaseAdmin } from "@/lib/supabase/server";

export async function subscribeToPushNotifications(subscription: any, origin?: string) {
    try {
        const supabase = await createServerActionClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        const { error } = await supabaseAdmin
            .from('push_subscriptions')
            .upsert({
                user_id: user.id,
                endpoint: subscription.endpoint,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
                origin: origin || 'https://www.zigexconnect.com'
            }, {
                onConflict: 'user_id,endpoint'
            });

        if (error) {
            console.error('[PUSH] Failed to save subscription', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}
