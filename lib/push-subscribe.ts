import { subscribeToPushNotifications, unsubscribeFromPushNotifications } from "@/lib/actions/push.actions";
import { subscriptionMatchesKey, urlBase64ToUint8Array } from "@/lib/push-keys";

export type DevicePushState = "on" | "off" | "blocked";

/** Rejects with a message the student can act on when a step takes too long. */
function withinTime<T>(step: Promise<T>, ms: number, message: string): Promise<T> {
  return Promise.race([step, new Promise<T>((_, reject) => setTimeout(() => reject(new Error(message)), ms))]);
}

/** Set when a student turns notifications off here, so we don't subscribe them again by ourselves. */
const PUSH_OFF_KEY = "zigex_push_off";

export function pushTurnedOffHere() {
  try {
    return localStorage.getItem(PUSH_OFF_KEY) === "1";
  } catch {
    return false;
  }
}

export function rememberPushChoice(off: boolean) {
  try {
    if (off) localStorage.setItem(PUSH_OFF_KEY, "1");
    else localStorage.removeItem(PUSH_OFF_KEY);
  } catch {
    // Storage blocked: nothing to remember.
  }
}

/**
 * Asks the browser for permission, subscribes this device with the site's VAPID key
 * and saves the subscription for the signed-in student. Used by Settings and by the
 * "Turn on notifications" prompt. Throws an Error with a message the student can read.
 */
export async function enableDevicePush(key: string): Promise<DevicePushState> {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return permission === "denied" ? "blocked" : "off";

  await navigator.serviceWorker.register(process.env.NODE_ENV === "production" ? "/sw.js" : "/push-sw.js");
  // The app's background service must be running first; on a slow connection its
  // first setup can take a while, so say so instead of spinning forever.
  const reg = await withinTime(
    navigator.serviceWorker.ready,
    30_000,
    "Zigex is still setting up on this device. Keep this page open for a minute, then try again."
  );
  // Subscribing with a new key fails while an old-key subscription exists.
  const stale = await reg.pushManager.getSubscription();
  if (stale && !subscriptionMatchesKey(stale, key)) {
    await unsubscribeFromPushNotifications(stale.endpoint).catch(() => {});
    await stale.unsubscribe();
  }
  const sub = await withinTime(
    reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(key) }),
    20_000,
    "Couldn't reach the notification service. Check your connection and try again."
  );
  const res = await withinTime(
    subscribeToPushNotifications(sub.toJSON(), window.location.origin),
    20_000,
    "Zigex didn't answer in time. Check your connection and try again."
  );
  if (!res.success) {
    await sub.unsubscribe();
    throw new Error(res.pending ? "Notifications aren't available on Zigex yet." : "Notifications couldn't be turned on. Try again.");
  }
  rememberPushChoice(false);
  return "on";
}

/** Whether this device already receives Zigex notifications with the current key. */
export async function devicePushIsOn(key: string) {
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  return Boolean(sub && subscriptionMatchesKey(sub, key));
}
