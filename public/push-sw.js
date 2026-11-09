/// <reference lib="webworker" />

const SW_VERSION = '1.2.0';
console.log(`[PUSH_SW] Service Worker Version ${SW_VERSION} loaded.`);
self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || '/icons/icon-192.png',
      // Android shows the badge as a monochrome silhouette in the status bar.
      badge: data.badge || '/icons/badge-96.png',
      tag: data.tag || 'zigex-notification',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '2',
        url: data.url || '/notifications'
      }
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  // Only follow paths on this site; anything else opens the notifications page.
  const raw = (event.notification.data && event.notification.data.url) || '/notifications';
  let target;
  try {
    target = new URL(raw, self.location.origin);
    if (target.origin !== self.location.origin) target = new URL('/notifications', self.location.origin);
  } catch (e) {
    target = new URL('/notifications', self.location.origin);
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      // Reuse a Zigex tab: the one already on that page, else any Zigex tab.
      const same = clientList.filter(function (c) { return c.url.indexOf(self.location.origin) === 0; });
      const exact = same.find(function (c) { return c.url === target.href; });
      if (exact) return exact.focus();
      const tab = same[0];
      if (tab && 'navigate' in tab) {
        return tab.focus().then(function (c) { return (c || tab).navigate(target.href); }).catch(function () {
          return clients.openWindow(target.href);
        });
      }
      return clients.openWindow(target.href);
    })
  );
});

/**
 * The browser dropped or replaced this device's subscription (it expired, or it
 * was made with an old key). Subscribe again with Zigex's current key and save
 * it for the signed-in student, so notifications keep arriving without the
 * student having to open Zigex. Same-origin requests carry the session cookie.
 */
function base64UrlToBytes(value) {
  const padded = (value + '='.repeat((4 - (value.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(padded);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

self.addEventListener('pushsubscriptionchange', function (event) {
  event.waitUntil(
    (async function () {
      const res = await fetch('/api/push-key');
      const key = res.ok ? (await res.json()).key : '';
      if (!key) return;
      const subscription = await self.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64UrlToBytes(key),
      });
      const json = subscription.toJSON();
      await fetch('/api/v1/push/subscriptions', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys, origin: self.location.origin }),
      });
    })().catch(function (error) {
      console.warn('[PUSH_SW] Could not renew the subscription:', error);
    })
  );
});
