// ─────────────────────────────────────────────────────────────────────────────
// HeadField CRM — Service Worker
// Handles: Push notifications, notification click actions
// ─────────────────────────────────────────────────────────────────────────────

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

// ── Push event — show notification ───────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: '🔔 Reminder', body: event.data.text() };
  }

  const options = {
    body:               payload.body    || 'You have a reminder.',
    icon:               '/favicon.svg',
    badge:              '/favicon.svg',
    tag:                payload.tag     || 'reminder',
    data:               payload.data    || {},
    requireInteraction: payload.requireInteraction || false,
    vibrate:            payload.vibrate || [200, 100, 200],
    actions:            payload.actions || [
      { action: 'done',   title: '✅ Mark Done'    },
      { action: 'snooze', title: '⏰ Snooze 30 min' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(payload.title || '🔔 Reminder', options)
  );
});

// ── Notification click — open app or handle action ───────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const { reminderId, url } = event.notification.data || {};
  const action = event.action;

  // Handle action buttons
  if (action === 'done' && reminderId) {
    // Best-effort API call to mark done
    event.waitUntil(
      fetch(`/api/b/realtor/reminders/${reminderId}/done`, {
        method:  'PATCH',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${getCachedToken()}`,
        },
      }).catch(() => {})
    );
    return;
  }

  if (action === 'snooze' && reminderId) {
    event.waitUntil(
      fetch(`/api/b/realtor/reminders/${reminderId}/snooze`, {
        method:  'PATCH',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${getCachedToken()}`,
        },
        body: JSON.stringify({ minutes: 30 }),
      }).catch(() => {})
    );
    return;
  }

  // Default click — open the CRM app
  const targetUrl = url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // If app already open — focus it
      for (const client of clients) {
        if ('focus' in client) return client.focus();
      }
      // Otherwise open new window
      return self.clients.openWindow(targetUrl);
    })
  );
});

// Helper — read token from cache (best-effort)
function getCachedToken() {
  try {
    return self.__token || '';
  } catch {
    return '';
  }
}
