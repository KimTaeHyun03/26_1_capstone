// Service Worker — Web Push 급식 알림

self.addEventListener('push', (event) => {
  if (!event.data) return

  const data = event.data.json()
  const title = data.title || '반려동물 급식 알림'
  const options = {
    body: data.body || '급식 시간입니다',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'feeding-notification',
    renotify: true,
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/feeding') && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/feeding')
      }
    })
  )
})
