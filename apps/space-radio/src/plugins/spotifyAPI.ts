import { usePersonalStore } from '@/store/PersonalStore'
import { refreshAccessToken } from 'shared'
import SpotifyWebApi from 'spotify-web-api-js'

const spotifyAPI = new Proxy(new SpotifyWebApi(), {
  get: function (target, property) {
    if (property === 'getAccessToken' || property === 'setAccessToken') {
      return target[property]
    }
    const personalStore = usePersonalStore()
    if (!personalStore.isTokenValid()) {
      return (...theArguments: any[]) =>
        refreshAccessToken({ client_id: import.meta.env.VITE_CLIENT_ID, refresh_token: personalStore.refresh_token! })
          .then(() => {
            spotifyAPI.setAccessToken(usePersonalStore().access_token)
            // @ts-expect-error
            return target[property](...theArguments)
          })
          .catch(error => {
            console.error('error when refreshAccessToken', error)
          })
    }
    // @ts-expect-error
    return target[property]
  },
})

if (import.meta.env.DEV) {
  // @ts-expect-error
  window.spotifyAPI = spotifyAPI
}

export { spotifyAPI }
