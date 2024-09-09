import { getToken } from 'firebase/messaging'
import { messaging } from './plugins/firebase'

export function registerSW() {
  return new Promise<string>((resolve, reject) => {
    if (!('serviceWorker' in navigator)) reject('Service workers are not supported by this browser')
    if (Notification.permission === 'denied') reject('Notifications are blocked by the user')
    if (Notification.permission === 'default') reject("The user hasn't granted permission to receive notifications")

    navigator.serviceWorker
      .register(import.meta.env.MODE === 'production' ? '/service-worker.js' : '/dev-sw.js?dev-sw')
      .then(registration => {
        console.log('Service Worker registered')
        getToken(messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_MESSAGING_VAPID_KEY,
          serviceWorkerRegistration: registration,
        })
          .then(currentToken => {
            const previous = localStorage.getItem('sw')
            if (previous && previous !== currentToken) {
              console.error('??')
            } else {
              console.log('!!')
            }
            localStorage.setItem('sw', currentToken)

            console.log('🚀 ~ registerSW ~ currentToken:', currentToken)
            if (currentToken) {
              console.log('🚀 ~ onMounted ~ currentToken:', currentToken)
              resolve(currentToken)
              // Send the token to your server and update the UI if necessary
            } else {
              // Show permission request UI
              console.error('No registration token available. Request permission to generate one.')
            }
          })
          .catch(err => {
            console.error('An error occurred while retrieving token. ', err)
            reject(err)
          })
      })
  })
}
