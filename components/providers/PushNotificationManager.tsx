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
            // In production, next-pwa registers 'sw.js'. In development, it's disabled.
            // We use 'push-sw.js' as a fallback or specific worker.
            const swPath = process.env.NODE_ENV === 'production' ? '/sw.js' : '/push-sw.js';
            
            console.log(`[PUSH_MANAGER] Attempting registration with: ${swPath}`);
            const registration = await navigator.serviceWorker.register(swPath);
            await navigator.serviceWorker.ready; 
            
            console.log('[PUSH_MANAGER] Service Worker ready. Scope:', registration.scope);

            // Check existing subscription
            const existingSubscription = await registration.pushManager.getSubscription();
            if (existingSubscription) {
                console.log("[PUSH_MANAGER] Existing subscription found, syncing with server...");
                const serialized = existingSubscription.toJSON();
                await subscribeToPushNotifications(serialized, window.location.origin);
                return;
            }

            // Ask permission
            console.log("[PUSH_MANAGER] Requesting notification permission...");
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                console.warn("[PUSH_MANAGER] Permission denied by user.");
                return;
            }

            const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            if (!publicVapidKey) {
                console.error("[PUSH_MANAGER] CRITICAL: NEXT_PUBLIC_VAPID_PUBLIC_KEY missing.");
                return;
            }

            // Create new push subscription
            console.log("[PUSH_MANAGER] Creating new subscription...");
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
            });

            const serialized = subscription.toJSON();
            const result = await subscribeToPushNotifications(serialized, window.location.origin);
            
            if (result.success) {
                console.log("[PUSH_MANAGER] Successfully subscribed and synced with server.");
            } else {
                console.error("[PUSH_MANAGER] Subscription saved to browser but failed to sync with server:", result.error);
            }
            
        } catch (err) {
            console.error("[PUSH_MANAGER] Setup failed:", err);
        }
    }, []);

    useEffect(() => {
        registerServiceWorkerAndSubscribe();
    }, [registerServiceWorkerAndSubscribe]);

    return null; // Silent global manager
}
