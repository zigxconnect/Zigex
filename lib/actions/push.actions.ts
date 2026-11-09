"use server";

import { serverApi } from "@/lib/api/server-client";
import { isEndpointMissing } from "@/lib/api/errors";

// Matches the browser's PushSubscription.toJSON(), whose fields are optional.
type SerializedSubscription = { endpoint?: string; keys?: Record<string, string> };

/**
 * Saves this browser's push subscription for the signed-in student
 * (POST /push/subscriptions). `pending` = the backend has not deployed the
 * endpoint yet (see the Oct 2026 backend endpoint request → Notifications and push).
 */
export async function subscribeToPushNotifications(
    subscription: SerializedSubscription,
    origin?: string
): Promise<{ success: boolean; pending?: boolean; error?: string }> {
    const { endpoint, keys } = subscription;
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
        return { success: false, error: "Invalid push subscription" };
    }
    try {
        await serverApi.post("/push/subscriptions", {
            endpoint,
            keys: { p256dh: keys.p256dh, auth: keys.auth },
            origin: origin || "https://www.zigexconnect.com",
        });
        return { success: true };
    } catch (err) {
        if (isEndpointMissing(err)) {
            return { success: false, pending: true, error: "Push notifications are not available yet." };
        }
        console.error("[PUSH] Failed to save subscription", err);
        return { success: false, error: err instanceof Error ? err.message : "Failed to save subscription" };
    }
}

/** Removes this browser's push subscription (DELETE /push/subscriptions). */
export async function unsubscribeFromPushNotifications(endpoint: string): Promise<{ success: boolean }> {
    try {
        await serverApi.delete("/push/subscriptions", { body: { endpoint } });
        return { success: true };
    } catch (err) {
        if (!isEndpointMissing(err)) console.error("[PUSH] Failed to remove subscription", err);
        return { success: false };
    }
}

export type TestPushResult = { sent: number; devices: number };

/** Sends "Test notification from Zigex" to this device (POST /push/test). */
export async function sendTestPush(endpoint?: string): Promise<TestPushResult | null> {
    try {
        const res = await serverApi.post<{ sent: number; subscriptions: number }>("/push/test", endpoint ? { endpoint } : {});
        return { sent: res.data?.sent ?? 0, devices: res.data?.subscriptions ?? 0 };
    } catch (err) {
        if (!isEndpointMissing(err)) console.error("[PUSH] Test push failed", err);
        return null;
    }
}

/**
 * Whether this browser's subscription is still on record for the student (null: couldn't tell).
 * The server deletes subscriptions the push service reports as dead; the browser doesn't know.
 */
export async function pushSubscriptionRegistered(endpoint: string): Promise<boolean | null> {
    try {
        const res = await serverApi.post<{ registered: boolean }>("/push/subscriptions/status", { endpoint });
        return typeof res.data?.registered === "boolean" ? res.data.registered : null;
    } catch {
        return null;
    }
}
