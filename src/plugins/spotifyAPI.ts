import store from '@/store'
import { refreshAccessToken } from '@/utility/PKCE'
import SpotifyWebApi from 'spotify-web-api-js'

const spotifyAPI = new Proxy(new SpotifyWebApi(), {
  get: function (target, property) {
    if (property === 'getAccessToken' || property === 'setAccessToken') {
      return target[property]
    }
    if (!store.getters.isTokenValid) {
      return (...theArguments: any[]) =>
        refreshAccessToken()
          .then(() => {
            spotifyAPI.setAccessToken(store.getters.token)
            // @ts-expect-error
            target[property](...theArguments)
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
