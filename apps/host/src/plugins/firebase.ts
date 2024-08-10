// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'
import { getMessaging } from 'firebase/messaging'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyA8QD5Shdlh3fW1oMeGe8XwiVIgsCOM328',
  authDomain: 'jukebox-g100.firebaseapp.com',
  databaseURL: 'https://akijo-space.asia-southeast1.firebasedatabase.app/',
  projectId: 'jukebox-g100',
  storageBucket: 'jukebox-g100.appspot.com',
  messagingSenderId: '1011719496683',
  appId: '1:1011719496683:web:fe50ae6d689d451f2a2fae',
  measurementId: 'G-803MJPJYJ2',
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getDatabase(app)
export const messaging = getMessaging(app)

const analytics = getAnalytics(app)
