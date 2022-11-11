import store from '@/store'
import { refreshAccessToken } from './PKCE'
import SpotifyWebApi from 'spotify-web-api-js'

const spotifyAPI = new Proxy(new SpotifyWebApi(), {
  get: function (target, property) {
    if (property === 'getAccessToken' || property === 'setAccessToken') {
      return target[property]
    }
    if (!store.getters.isTokenValid) {
      return (...theArguments) =>
        refreshAccessToken()
          .then(() => {
            spotifyAPI.setAccessToken(store.getters.token)
            target[property](...theArguments)
          })
          .catch(error => {
            console.error('error when refreshAccessToken', error)
          })
    }
    return target[property]
  },
})

if (import.meta.env.DEV) {
  window.spotifyAPI = spotifyAPI
}

export { spotifyAPI }
