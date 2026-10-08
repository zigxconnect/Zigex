/// <reference lib="webworker" />

const SW_VERSION = '1.1.0';
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
