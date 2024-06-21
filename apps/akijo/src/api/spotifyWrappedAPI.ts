import { generateWrappedSpotifyApi, usePersonalStore } from 'shared'

export const spotifyWrappedAPI = generateWrappedSpotifyApi(usePersonalStore)
