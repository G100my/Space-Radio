import { generateWrappedSpotifyApi, usePersonalStore } from 'shared'

export const spotifyCustomerAPI = generateWrappedSpotifyApi(usePersonalStore)
