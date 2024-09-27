/// <reference lib="webworker" />
import { firebaseConfig } from '@/constant'
import { initializeApp } from 'firebase/app'
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw'

declare let self: ServiceWorkerGlobalScope

const firebaseApp = initializeApp(firebaseConfig)
const messaging = getMessaging(firebaseApp)

console.warn('[service-worker.js] Service Worker Loaded!')

onBackgroundMessage(messaging, payload => {
  console.log('[service-worker.js] Received background message ', payload)
  const notificationTitle = payload.notification?.title ?? ''
  const notificationOptions = payload.notification

  self.registration.showNotification(notificationTitle, notificationOptions)
})

self.skipWaiting()
