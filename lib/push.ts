import webpush from 'web-push';
import { supabaseAdmin } from '@/lib/supabase/server';

webpush.setVapidDetails(
    process.env.VAPID_SUBJECT as string,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
    process.env.VAPID_PRIVATE_KEY as string
);

export async function sendPushNotification(userId: string, payload: { title: string; body: string; url?: string; icon?: string }) {
    try {
        // Fetch user's push subscriptions
        const { data: subscriptions, error } = await supabaseAdmin
            .from('push_subscriptions')
            .select('endpoint, p256dh, auth')
            .eq('user_id', userId);

        if (error || !subscriptions || subscriptions.length === 0) {
            console.log(`[PUSH] No active push subscriptions found for user: ${userId}`);
            return;
        }

        // Send push to all active devices
        const notificationPromises = subscriptions.map((sub: any) => {
            const pushSubscription = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth,
                },
            };

            console.log(`[PUSH] Dispatching to device: ${sub.endpoint.substring(0, 30)}...`);
            return webpush.sendNotification(
                pushSubscription,
                JSON.stringify({
                    title: payload.title,
                    body: payload.body,
                    url: payload.url || '/',
                    icon: payload.icon || '/icons/icon-192x192.png',
                    badge: '/icons/icon-192x192.png',
                    tag: `notification-${Date.now()}`
                })
            ).then(() => {
                console.log(`[PUSH] Successfully delivered to ${sub.endpoint.substring(0, 30)}...`);
            }).catch(err => {
                if (err.statusCode === 404 || err.statusCode === 410) {
                    console.log(`[PUSH] Subscription expired or removed: ${sub.endpoint}`);
                    // Optional: remove stale subscription from DB here
                    supabaseAdmin.from('push_subscriptions').delete().eq('endpoint', sub.endpoint).then();
                } else {
                    console.error('[PUSH] Failed to send notification:', err);
                }
            });
        });

        await Promise.all(notificationPromises);
        console.log(`[PUSH] Sent payload to ${subscriptions.length} devices for user ${userId}`);
        
    } catch (err) {
        console.error('[PUSH_SYSTEM] Critical error sending push notification:', err);
    }
}
