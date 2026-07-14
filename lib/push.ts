import webpush from 'web-push';
import { supabaseAdmin } from '@/lib/supabase/server';

const { VAPID_SUBJECT, NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY } = process.env;

const isVapidConfigured = Boolean(VAPID_SUBJECT && NEXT_PUBLIC_VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY);

if (isVapidConfigured) {
    webpush.setVapidDetails(VAPID_SUBJECT!, NEXT_PUBLIC_VAPID_PUBLIC_KEY!, VAPID_PRIVATE_KEY!);
} else {
    console.warn('[PUSH] VAPID env vars not set — push notifications are disabled.');
}

export async function sendPushNotification(userId: string, payload: { title: string; body: string; url?: string; icon?: string }) {
    if (!isVapidConfigured) return;

    try {
        // Fetch user's push subscriptions
        const { data: subscriptions, error } = await supabaseAdmin
            .from('push_subscriptions')
            .select('endpoint, p256dh, auth, origin')
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

            const siteUrl = sub.origin || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.zigexconnect.com';
            const notificationUrl = payload.url?.startsWith('http') ? payload.url : `${siteUrl}${payload.url || '/'}`;
            const iconUrl = `${siteUrl}/icons/icon-192x192.png`;

            console.log(`[PUSH] Dispatching to device: ${sub.endpoint.substring(0, 30)}...`);
            return webpush.sendNotification(
                pushSubscription,
                JSON.stringify({
                    title: payload.title,
                    body: payload.body,
                    url: notificationUrl,
                    icon: payload.icon || iconUrl,
                    badge: iconUrl,
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

export async function broadcastPushNotification(payload: { title: string; body: string; url?: string; icon?: string }) {
    if (!isVapidConfigured) return;

    try {
        console.log(`[PUSH_BROADCAST] Starting broadcast for: ${payload.title}`);

        // Fetch all active push subscriptions for users who have notifications enabled
        // Joining with student_profiles to honor their preference
        const { data: subscriptions, error } = await supabaseAdmin
            .from('push_subscriptions')
            .select(`
                endpoint, 
                p256dh, 
                auth,
                user_id,
                origin
            `)
            .in('user_id', (
                await supabaseAdmin
                    .from('student_profiles')
                    .select('user_id')
                    .eq('is_subscribed_to_notifications', true)
            ).data?.map(u => u.user_id) || []);

        if (error || !subscriptions || subscriptions.length === 0) {
            console.log(`[PUSH_BROADCAST] No active subscriptions found or error:`, error);
            return;
        }

        console.log(`[PUSH_BROADCAST] Targeting ${subscriptions.length} devices...`);

        const batchSize = 50;
        let successful = 0;
        let failed = 0;

        for (let i = 0; i < subscriptions.length; i += batchSize) {
            const batch = subscriptions.slice(i, i + batchSize);
            console.log(`[PUSH_BROADCAST] Processing batch ${Math.floor(i / batchSize) + 1}...`);

            const results = await Promise.allSettled(
                batch.map((sub: any) => {
                    const pushSubscription = {
                        endpoint: sub.endpoint,
                        keys: {
                            p256dh: sub.p256dh,
                            auth: sub.auth,
                        },
                    };

                    const siteUrl = sub.origin || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.zigexconnect.com';
                    const notificationUrl = payload.url?.startsWith('http') ? payload.url : `${siteUrl}${payload.url || '/'}`;
                    const iconUrl = `${siteUrl}/icons/icon-192x192.png`;

                    return webpush.sendNotification(
                        pushSubscription,
                        JSON.stringify({
                            title: payload.title,
                            body: payload.body,
                            url: notificationUrl,
                            icon: payload.icon || iconUrl,
                            badge: iconUrl,
                            tag: `broadcast-${Date.now()}`
                        })
                    ).catch(err => {
                        if (err.statusCode === 404 || err.statusCode === 410) {
                            // Cleanup expired subscription
                            supabaseAdmin.from('push_subscriptions').delete().eq('endpoint', sub.endpoint).then();
                            throw new Error('Expired');
                        }
                        throw err;
                    });
                })
            );

            successful += results.filter(r => r.status === 'fulfilled').length;
            failed += results.filter(r => r.status === 'rejected').length;
        }

        console.log(`[PUSH_BROADCAST] Finished: ${successful} delivered, ${failed} failed.`);
        
    } catch (err) {
        console.error('[PUSH_BROADCAST] Critical error during broadcast:', err);
    }
}
