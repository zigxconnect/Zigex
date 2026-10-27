import { api } from "@/lib/api/browser-client";
import { unsubscribeFromPushNotifications } from "@/lib/actions/push.actions";

/** At most this long on push cleanup, so a slow connection can't hold up signing out. */
const PUSH_CLEANUP_MS = 4_000;

/**
 * Sign out from any menu. First stops this device's push notifications
 * (while the session still exists to remove the subscription on the
 * backend): on a shared or cybercafé phone, the next person must not get the
 * previous student's notifications. Then ends the session and goes home.
 */
export async function signOut(): Promise<void> {
  const cleanup = (async () => {
    const reg = await navigator.serviceWorker?.getRegistration();
    const sub = await reg?.pushManager.getSubscription();
    if (!sub) return;
    await unsubscribeFromPushNotifications(sub.endpoint).catch(() => undefined);
    await sub.unsubscribe().catch(() => undefined);
  })().catch(() => undefined);
  await Promise.race([cleanup, new Promise((resolve) => setTimeout(resolve, PUSH_CLEANUP_MS))]);

  try {
    // Lets PushNotificationManager subscribe the next person who signs in here.
    localStorage.removeItem("zigex_push_synced");
  } catch {
    // Storage blocked: nothing to clear.
  }
  await api.post("/auth/logout").catch(() => undefined);
  window.location.href = "/";
}
