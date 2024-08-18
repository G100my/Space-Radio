/// <reference lib="webworker" />
import type { MessagePayload } from 'firebase/messaging'

declare let self: ServiceWorkerGlobalScope
self.addEventListener('push', function (event) {
  if (!event.data) {
    console.log('This push event has no data.')
    return
  }

  let payload: MessagePayload
  try {
    payload = event.data.json()
    console.log('🚀 ~ data:', payload)
  } catch (error) {
    self.registration.showNotification('Akijo', { body: event.data.text() })
    return
  }

  const data = JSON.parse(payload.data?.body ?? '{}')
  const body = `${data.name} - ${data.artists.map((a: { name: string }) => a.name).join(', ')}`
  const promiseChain = self.registration.showNotification(payload.data?.title ?? 'Lubn App', {
    body,
  })

  // collapse notifications
  // https://web.dev/articles/push-notifications-common-notification-patterns#merging_notifications

  event.waitUntil(promiseChain)
})
