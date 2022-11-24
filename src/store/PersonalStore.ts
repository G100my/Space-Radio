import { spotifyAPI } from '@/plugins/spotifyAPI'
import { defineStore } from 'pinia'
import { useRoomBasicStore } from './RoomBasicStore'

export const usePersonalStore = defineStore('PersonalStore', {
  state: () => ({
    token: localStorage.getItem('spaceradio_token') || null,
    expired_time: Number(localStorage.getItem('spaceradio_expired_time')) || null,
    refresh_token: localStorage.getItem('spaceradio_refresh_token') || null,

    user_id: localStorage.getItem('spaceradio_user_id') || '',
    display_name: localStorage.getItem('spaceradio_user_display_name') || '',
    image_url: localStorage.getItem('spaceradio_user_images') || '',
    product: localStorage.getItem('spaceradio_user_product') || '',

    customerPlayerMode: false,
  }),
  getters: {
    isTokenValid: state => {
      if (state.expired_time === null) return false
      const now = Date.now()
      return state.expired_time > now
    },
    isPremium: state => state.product === 'premium',
    isHostUser(state) {
      const roomBasic = useRoomBasicStore()
      if (!roomBasic.host_id || !state.user_id) return undefined
      else return roomBasic.host_id === state.user_id
    },
  },
  actions: {
    updateToken({ access_token, expiredTime, refresh_token }: unknown) {
      this.token = access_token
      this.expired_time = expiredTime
      this.refresh_token = refresh_token

      localStorage.setItem('spaceradio_token', access_token)
      localStorage.setItem('spaceradio_expired_time', expiredTime)
      localStorage.setItem('spaceradio_refresh_token', refresh_token)

      spotifyAPI.setAccessToken(access_token)
    },
    userData({ id, display_name, images, product }: SpotifyApi.CurrentUsersProfileResponse) {
      this.user_id = id
      this.display_name = display_name ?? id
      this.product = product
      localStorage.setItem('spaceradio_user_id', id)
      localStorage.setItem('spaceradio_user_display_name', this.display_name)
      localStorage.setItem('spaceradio_user_product', product)

      if (images && images.length > 0) {
        this.image_url = images[0].url
        localStorage.setItem('spaceradio_user_images', images[0].url)
      }
    },
    toggleCustomerPlayer(payload: boolean) {
      this.customerPlayerMode = payload
    },
  },
})
