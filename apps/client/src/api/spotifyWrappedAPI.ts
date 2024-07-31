import { generateWrappedSpotifyApi, usePersonalStore } from 'shared'

export const spotifyWrappedAPI = generateWrappedSpotifyApi(import.meta.env.VITE_CLIENT_ID, usePersonalStore)
