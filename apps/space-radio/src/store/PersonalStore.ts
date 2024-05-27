import { spotifyAPI } from '@/plugins/spotifyAPI'
import { defineStore } from 'pinia'

const storageKeys = {
  token: 'spaceradio_token',
  expiredTime: 'spaceradio_expired_time',
  refreshToken: 'spaceradio_refresh_token',
  userID: 'spaceradio_user_id',
  name: 'spaceradio_user_display_name',
  image: 'spaceradio_user_images',
  plan: 'spaceradio_user_product',
}

export const usePersonalStore = defineStore('PersonalStore', {
  state: () => ({
    access_token: localStorage.getItem(storageKeys.token) || '',
    expired_time: Number(localStorage.getItem(storageKeys.expiredTime)) || null,
    refresh_token: localStorage.getItem(storageKeys.refreshToken) || null,

    id: localStorage.getItem(storageKeys.userID) || '',
    display_name: localStorage.getItem(storageKeys.name) || '',
    image_url: localStorage.getItem(storageKeys.image) || '',
    product: localStorage.getItem(storageKeys.plan) || '',
  }),
  getters: {
    isTokenValid: state => () => {
      if (!state.expired_time) return false
      const now = Date.now()
      return state.expired_time > now
    },
    isPremium: state => state.product === 'premium',
  },
  actions: {
    updateToken(params: { access_token: string; expired_time: number; refresh_token: string }) {
      this.$patch(params)
      localStorage.setItem(storageKeys.token, params.access_token)
      localStorage.setItem(storageKeys.expiredTime, params.expired_time.toString())
      localStorage.setItem(storageKeys.refreshToken, params.refresh_token)

      spotifyAPI.setAccessToken(params.access_token)
    },
    updateUserData({ id, display_name, images, product }: SpotifyApi.CurrentUsersProfileResponse) {
      this.$patch({ id, display_name, product })
      localStorage.setItem(storageKeys.userID, id)
      localStorage.setItem(storageKeys.name, this.display_name)
      localStorage.setItem(storageKeys.plan, product)

      if (images && images.length > 0) {
        this.image_url = images[0].url
        localStorage.setItem(storageKeys.image, images[0].url)
      }
    },
  },
})
