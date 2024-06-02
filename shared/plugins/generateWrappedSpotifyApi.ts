/// <reference types="vite/client" />
import type { usePersonalStore } from '../index'
import { refreshAccessToken } from '../utils/PKCE'
import SpotifyWebApi from 'spotify-web-api-js'

const generateWrappedSpotifyApi = (useStore: typeof usePersonalStore) => {
  const spotifyAPI = new Proxy(new SpotifyWebApi(), {
    get: function (target, property) {
      if (property === 'getAccessToken' || property === 'setAccessToken') {
        return target[property]
      }
      const store = useStore()
      if (!store.isTokenValid()) {
        return (...theArguments: any[]) =>
          refreshAccessToken({ client_id: import.meta.env.VITE_CLIENT_ID, refresh_token: store.refresh_token! })
            .then(() => {
              spotifyAPI.setAccessToken(store.access_token)
              //@ts-ignore
              return target[property](...theArguments)
            })
            .catch(error => {
              console.error('error when refreshAccessToken', error)
            })
      }
      //@ts-ignore
      return target[property]
    },
  })

  if (import.meta.env.DEV) {
    // @ts-expect-error
    window.spotifyAPI = spotifyAPI
  }
  return spotifyAPI
}

export { generateWrappedSpotifyApi }
