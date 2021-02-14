import { spotifyAPI } from '../plugin/spotify-web-api.js'

const Personal = {
  state: {
    userId: 'zhangLo',
    token: localStorage.getItem('jukebox_token') || null,
    expiredTime: Number(localStorage.getItem('jukebox_expired_time')) || null,
    playlists: null,
    image: null,
  },
  getters: {
    token(state) {
      return state.token
    },
    isTokenValid(state) {
      if (state.expiredTime === null) return false
      const now = Date.now()
      return state.expiredTime > now
    },
    userId(state) {
      return state.userId
    },
  },
  mutations: {
    refreshToken(state, { newToken, expiredTime }) {
      state.token = newToken
      state.expiredTime = expiredTime
      localStorage.setItem('jukebox_token', newToken)
      localStorage.setItem('jukebox_expired_time', expiredTime)
    },
  },
}

export { Personal }
