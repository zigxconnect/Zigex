import { subscribeToPushNotifications, unsubscribeFromPushNotifications } from "@/lib/actions/push.actions";
import { subscriptionMatchesKey, urlBase64ToUint8Array } from "@/lib/push-keys";

export type DevicePushState = "on" | "off" | "blocked";

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

  const reg = await navigator.serviceWorker.register(process.env.NODE_ENV === "production" ? "/sw.js" : "/push-sw.js");
  await navigator.serviceWorker.ready;
  // Subscribing with a new key fails while an old-key subscription exists.
  const stale = await reg.pushManager.getSubscription();
  if (stale && !subscriptionMatchesKey(stale, key)) {
    await unsubscribeFromPushNotifications(stale.endpoint).catch(() => {});
    await stale.unsubscribe();
  }
  const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(key) });
  const res = await subscribeToPushNotifications(sub.toJSON(), window.location.origin);
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
