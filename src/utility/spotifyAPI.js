import store from '../store'
import { refreshAccessToken } from './PKCE.js'
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

// will remove in future
export default {
  install: app => {
    app.config.globalProperties.$spotifyAPI = spotifyAPI
    window.$spotifyAPI = spotifyAPI

    app.provide('spotifyAPI', spotifyAPI)
  },
}

export { spotifyAPI }
