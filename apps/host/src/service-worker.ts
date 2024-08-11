/// <reference lib="webworker" />
import type { MessagePayload } from 'firebase/messaging'

declare let self: ServiceWorkerGlobalScope
self.addEventListener('push', function (event) {
  if (!event.data) {
    console.log('This push event has no data.')
    return
  }

  let data: MessagePayload
  try {
    data = event.data.json()
    console.log('🚀 ~ data:', data)
  } catch (error) {
    self.registration.showNotification('Akijo', { body: event.data.text() })
    return
  }

  const options: NotificationOptions = data.notification!

  const promiseChain = self.registration.showNotification(data.notification!.title ?? 'Lubn App', options)

  // collapse notifications
  // https://web.dev/articles/push-notifications-common-notification-patterns#merging_notifications

  event.waitUntil(promiseChain)
})
