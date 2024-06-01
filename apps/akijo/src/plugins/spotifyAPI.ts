import { generateWrappedSpotifyApi, usePersonalStore } from 'shared'

export const spotifyAPI = generateWrappedSpotifyApi(usePersonalStore)
