"use client";

import { useEffect, useCallback } from "react";
import { subscribeToPushNotifications } from "@/lib/actions/push.actions";

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}


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
            const existingSubscription = await registration.pushManager.getSubscription();
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
