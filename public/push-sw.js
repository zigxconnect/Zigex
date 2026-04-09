/// <reference lib="webworker" />

self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || '/icons/icon-192x192.png',
      badge: data.badge || '/icons/icon-192x192.png',
      tag: data.tag || 'zigex-notification',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '2',
        url: data.url || '/'
      }
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      const url = event.notification.data.url;
      
      // If we have any matching window, navigate it and focus
      for (const client of clientList) {
          if ('navigate' in client && url) {
              client.focus();
              return client.navigate(url);
          }
      }

      // If no open windows or navigate fails, open new one
      if (clients.openWindow && url) {
          return clients.openWindow(url);
      }
    })
  );
});
