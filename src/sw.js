import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

// Precache all assets
precacheAndRoute(self.__WB_MANIFEST);

// Runtime caching
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/products'),
  new StaleWhileRevalidate({
    cacheName: 'api-products',
    plugins: [
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 86400 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
);

registerRoute(
  ({ url }) => url.hostname === 'res.cloudinary.com',
  new CacheFirst({
    cacheName: 'cloudinary-images',
    plugins: [
      new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
);

// ── Push notification handler ─────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const { title, body, icon, badge, url, tag } = data;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: icon || '/pwa-192x192.png',
      badge: badge || '/pwa-64x64.png',
      tag,
      data: { url },
      vibrate: [100, 50, 100],
      actions: [
        { action: 'open', title: 'View', icon: '/pwa-64x64.png' },
        { action: 'close', title: 'Dismiss' },
      ],
    })
  );
});

// ── Notification click handler ────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If app is already open, focus it and navigate
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.postMessage({ type: 'NAVIGATE', url });
          return;
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// ── Background sync (optional — retry failed API calls) ──────────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-cart') {
    event.waitUntil(
      // Just a placeholder — you can implement cart sync here if needed
      Promise.resolve()
    );
  }
});