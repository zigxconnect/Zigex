/** VAPID public key (base64url) to the bytes PushManager.subscribe expects. */
export function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) out[i] = raw.charCodeAt(i);
  return out;
}

/**
 * Whether a browser subscription was made with the current VAPID key. When
 * the backend changes its key pair, old subscriptions silently stop
 * receiving pushes and must be replaced.
 */
export function subscriptionMatchesKey(sub: PushSubscription, publicKey: string) {
  const current = sub.options?.applicationServerKey;
  if (!current) return true; // browser doesn't expose it; assume it's fine
  const a = new Uint8Array(current);
  const b = urlBase64ToUint8Array(publicKey);
  return a.length === b.length && a.every((v, i) => v === b[i]);
}
