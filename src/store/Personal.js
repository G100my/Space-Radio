import { spotifyAPI } from '../utility/spotifyAPI.js'

const Personal = {
  state: {
    token: localStorage.getItem('spaceradio_token') || null,
    expired_time: Number(localStorage.getItem('spaceradio_expired_time')) || null,
    refresh_token: localStorage.getItem('spaceradio_refresh_token') || null,

    user_id: localStorage.getItem('spaceradio_user_id') || null,
    display_name: localStorage.getItem('spaceradio_user_display_name') || null,
    image_url: localStorage.getItem('spaceradio_user_images') || '',
    product: localStorage.getItem('spaceradio_user_product') || '',

    customerPlayerMode: false,
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
    userImage(state) {
      return state.image_url
    },
    accountLevel(state) {
      return state.product
    },
    isHostUser(_state, getters, _rootState, rootGetters) {
      if (!rootGetters.hostId || !getters.userId) return undefined
      else return rootGetters.hostId === getters.userId
    },
    refresh_token(state) {
      return state.refresh_token
    },
    customerPlayerMode(state) {
      return state.customerPlayerMode
    },
  },
  mutations: {
    tokens(state, { access_token, expiredTime, refresh_token }) {
      state.token = access_token
      state.expired_time = expiredTime
      state.refresh_token = refresh_token

      localStorage.setItem('spaceradio_token', access_token)
      localStorage.setItem('spaceradio_expired_time', expiredTime)
      localStorage.setItem('spaceradio_refresh_token', refresh_token)

      spotifyAPI.setAccessToken(access_token)
    },
    userData(state, { id, display_name, images, product }) {
      state.user_id = id
      state.display_name = display_name
      state.product = product
      localStorage.setItem('spaceradio_user_id', id)
      localStorage.setItem('spaceradio_user_display_name', display_name)
      localStorage.setItem('spaceradio_user_product', product)

      if (images.length > 0) {
        state.image_url = images[0].url
        localStorage.setItem('spaceradio_user_images', images[0].url)
      }
    },
    toggleCustomerPlayer(state, payload) {
      state.customerPlayerMode = payload
    },
  },
}

export { Personal }
