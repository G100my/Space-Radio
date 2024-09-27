import { getToken, deleteToken } from 'firebase/messaging'
import { messaging } from '@/plugins/firebase'

export async function getFCMtoken(): Promise<string> {
  return navigator.serviceWorker.ready.then(serviceWorkerRegistration => {
    return getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_MESSAGING_VAPID_KEY,
      serviceWorkerRegistration,
    })
      .then(currentToken => {
        const previous = localStorage.getItem('sw')
        console.warn('🚀 ~ checkSuscribeState ~ previous === currentToken:', previous === currentToken)
        localStorage.setItem('sw', currentToken)
        return currentToken
      })
      .catch(err => {
        console.error('An error occurred while retrieving token. ', err)
        return err
      })
  })
}

export async function deleteFCMtoken() {
  return await deleteToken(messaging).then(result => (result ? Promise.resolve() : Promise.reject()))
}
