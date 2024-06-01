/// <reference types="vite/client" />
/// <reference types="spotify-web-playback-sdk" />
/// <reference types="vite-svg-loader" />

declare module 'https://sdk.scdn.co/spotify-player.js' {
  // specific definitions here
  // export const bar: string
}

interface ImportMetaEnv {
  readonly VITE_FIREBASE_APIKEY: string
  readonly VITE_FIREBASE_APP_ID: string
  readonly VITE_FIREBASE_AUTHDOMAIN: string
  readonly VITE_FIREBASE_DATABASE_URL: string
  readonly VITE_FIREBASE_MEASUREMENT_ID: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string

  readonly VITE_CLIENT_ID: string
  readonly VITE_BASE_URI: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
