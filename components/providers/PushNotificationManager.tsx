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

import { toast } from "react-hot-toast";

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

            // If no subscription, ask for permission
            console.log("[PUSH_MANAGER] No subscription found. Checking permission...");
            if (Notification.permission === 'denied') {
                console.warn("[PUSH_MANAGER] Permission already denied.");
                return;
            }

            if (Notification.permission !== 'granted') {
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    toast.error("Please allow notifications to stay updated.");
                    return;
                }
            }

            const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            if (!publicVapidKey) {
                console.error("[PUSH_MANAGER] Public VAPID key missing from env!");
                return;
            }

            toast.loading("Setting up notifications...", { id: "push-setup" });

            // Create new push subscription
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
            });

            const serialized = subscription.toJSON();
            const syncResult = await subscribeToPushNotifications(serialized, window.location.origin);
            
            if (syncResult.success) {
                toast.success("Notifications enabled successfully!", { id: "push-setup" });
            } else {
                console.error("[PUSH_MANAGER] Sync failed:", syncResult.error);
                toast.error("Failed to sync notifications with server.", { id: "push-setup" });
            }
            
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
