import firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/analytics'

const firebaseConfig = {
  apiKey: 'AIzaSyB-HWD3Pt7BfqvinZMrAp9oWsZSHlQT7HE',
  authDomain: 'jukebox-g100.firebaseapp.com',
  databaseURL: 'https://jukebox-g100-default-rtdb.firebaseio.com',
  projectId: 'jukebox-g100',
  storageBucket: 'jukebox-g100.appspot.com',
  messagingSenderId: '1011719496683',
  appId: '1:1011719496683:web:cc26d5b6947bfa0a2a2fae',
  measurementId: 'G-ZHDT9YNGWR',
}

firebase.initializeApp(firebaseConfig)
firebase.analytics()

export default firebase
