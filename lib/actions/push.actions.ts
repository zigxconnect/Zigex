"use server";

import { serverApi } from "@/lib/api/server-client";
import { isEndpointMissing } from "@/lib/api/errors";

// Matches the browser's PushSubscription.toJSON(), whose fields are optional.
type SerializedSubscription = { endpoint?: string; keys?: Record<string, string> };

/**
 * Saves this browser's push subscription for the signed-in student
 * (POST /push/subscriptions). `pending` = the backend has not deployed the
 * endpoint yet (see docs/backend-missing-endpoints.md → Notifications and push).
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
