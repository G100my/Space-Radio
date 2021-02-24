const Personal = {
  state: {
    userId: '',
    display_name: '',
    imagesUrl: '',
    token: localStorage.getItem('jukebox_token') || null,
    expiredTime: Number(localStorage.getItem('jukebox_expired_time')) || null,
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
    updateUserData(state, { id, display_name, images }) {
      state.userId = id
      state.display_name = display_name
      state.imagesUrl = images[0].url
    },
  },
}

export { Personal }
