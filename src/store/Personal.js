const Personal = {
  state: {
    user_id: localStorage.getItem('jukebox_user_id') || null,
    display_name: localStorage.getItem('jukebox_user_display_name') || null,
    image_url: localStorage.getItem('jukebox_user_images') || '',
    token: localStorage.getItem('jukebox_token') || null,
    expired_time: Number(localStorage.getItem('jukebox_expired_time')) || null,
    refresh_token: localStorage.getItem('jukebox_refresh_token') || null,
  },
  getters: {
    token(state) {
      return state.token
    },
    isTokenValid(state) {
      if (state.expired_time === null) return false
      const now = Date.now()
      return state.expired_time > now
    },
    userId(state) {
      return state.user_id
    },
    userName(state) {
      return state.display_name
    },
    refreshToken(state) {
      return state.refresh_token
    },
  },
  mutations: {
    refreshToken(state, { access_token, expiredTime, refresh_token }) {
      state.token = access_token
      state.expired_time = expiredTime
      state.refresh_token = refresh_token

      localStorage.setItem('jukebox_token', access_token)
      localStorage.setItem('jukebox_expired_time', expiredTime)
      localStorage.setItem('jukebox_refresh_token', refresh_token)
    },
    updateUserData(state, { id, display_name, images }) {
      state.user_id = id
      state.display_name = display_name
      localStorage.setItem('jukebox_user_id', id)
      localStorage.setItem('jukebox_user_display_name', display_name)
      console.log(images)

      if (images.length > 0) {
        state.image_url = images[0].url
        localStorage.setItem('jukebox_user_images', images[0].url)
      }
    },
  },
}

export { Personal }
