import { usePersonalStore } from '@/store'
import { generateWrappedSpotifyApi } from 'shared'

const spotifyAPI = generateWrappedSpotifyApi(usePersonalStore)

export { spotifyAPI }
