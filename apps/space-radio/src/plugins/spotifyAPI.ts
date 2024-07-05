import { usePersonalStore } from '@/store'
import { generateWrappedSpotifyApi } from 'shared'

const spotifyAPI = generateWrappedSpotifyApi(import.meta.env.VITE_CLIENT_ID, usePersonalStore)

export { spotifyAPI }
