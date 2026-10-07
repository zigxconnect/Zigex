"use client";

import { useEffect, useCallback } from "react";
import { subscribeToPushNotifications, unsubscribeFromPushNotifications } from "@/lib/actions/push.actions";
import { subscriptionMatchesKey, urlBase64ToUint8Array } from "@/lib/push-keys";

export function PushNotificationManager() {
    const registerServiceWorkerAndSubscribe = useCallback(async () => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.log("Push notifications not supported in this browser.");
            return;
        }

        try {
            // Determine the correct service worker path
            // In production, next-pwa handles the main worker at /sw.js
            const swPath = process.env.NODE_ENV === 'production' ? '/sw.js' : '/push-sw.js';
            
            console.log(`[PUSH_MANAGER] Registering SW: ${swPath}`);
            const registration = await navigator.serviceWorker.register(swPath);
            
            // Wait for it to be active
            await navigator.serviceWorker.ready;
            console.log('[PUSH_MANAGER] SW ready at scope:', registration.scope);

            // Check existing subscription
            let existingSubscription = await registration.pushManager.getSubscription();
            const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            // The backend changed its key pair: replace the old subscription quietly
            // (permission was already given, so the browser doesn't ask again).
            if (existingSubscription && key && !subscriptionMatchesKey(existingSubscription, key)) {
                console.log("[PUSH_MANAGER] Subscription uses an old key; renewing it.");
                await unsubscribeFromPushNotifications(existingSubscription.endpoint).catch(() => {});
                await existingSubscription.unsubscribe().catch(() => {});
                existingSubscription = Notification.permission === "granted"
                    ? await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(key) })
                    : null;
            }
            if (existingSubscription) {
                console.log("[PUSH_MANAGER] Found existing subscription.");
                const serialized = existingSubscription.toJSON();
                const result = await subscribeToPushNotifications(serialized, window.location.origin);
                if (result.success) {
                    console.log("[PUSH_MANAGER] Subscription synced with server.");
                }
                return;
            }

            // No subscription yet: don't ask for permission on page load. Students
            // turn notifications on in Settings, where they understand why.
            return;
        } catch (err) {
            console.error("[PUSH_MANAGER] Setup failed:", err);
            // toast.error("Notification setup failed.");
        }
    }, []);

    useEffect(() => {
        registerServiceWorkerAndSubscribe();
    }, [registerServiceWorkerAndSubscribe]);

    return null; // Silent global manager
}

export default PushNotificationManager;
