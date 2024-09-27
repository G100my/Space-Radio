export interface TrackBaseInfo {
  name: SpotifyApi.TrackObjectSimplified['name']
  uri: SpotifyApi.TrackObjectSimplified['uri']
  preview_url: SpotifyApi.TrackObjectSimplified['preview_url']
  album: Pick<SpotifyApi.TrackObjectFull['album'], 'images' | 'name' | 'external_urls'>
  artists: Pick<SpotifyApi.ArtistObjectSimplified, 'external_urls' | 'name'>[]
}

export const routeMap = {
  Index: 'index',
  Sites: 'sites',
  Queue: 'queue',
  Settings: 'settings',
  NotFound: '404',
}

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTHDOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}
