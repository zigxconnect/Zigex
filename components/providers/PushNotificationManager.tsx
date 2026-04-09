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
            // Register our specific push service worker
            const registration = await navigator.serviceWorker.register('/push-sw.js');
            await navigator.serviceWorker.ready; // Wait until SW is active
            console.log('Push Service Worker registered with scope:', registration.scope);

            // Check existing subscription
            const existingSubscription = await registration.pushManager.getSubscription();
            if (existingSubscription) {
                // Keep backend in sync — must serialize PushSubscription to plain JSON
                const serialized = existingSubscription.toJSON();
                await subscribeToPushNotifications(serialized);
                return;
            }

            // Ask permission
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                console.log("Push notification permission denied.");
                return;
            }

            const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            if (!publicVapidKey) {
                console.error("VAPID Public Key missing from environment variables.");
                return;
            }

            // Create new push subscription
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
            });

            // Serialize before sending — PushSubscription keys don't survive transfer otherwise
            const serialized = subscription.toJSON();
            await subscribeToPushNotifications(serialized);
            console.log("Successfully subscribed to PWA Push Notifications.");
            
        } catch (err) {
            console.error("Failed to setup push notifications:", err);
        }
    }, []);

    useEffect(() => {
        registerServiceWorkerAndSubscribe();
    }, [registerServiceWorkerAndSubscribe]);

    return null; // Silent global manager
}
