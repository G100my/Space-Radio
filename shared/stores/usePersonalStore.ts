// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type SpotifyWebApi from 'spotify-web-api-js'
import { defineStore } from 'pinia'

const storageKeys = {
  token: 'spaceradio_token',
  expiredTime: 'spaceradio_expired_time',
  refreshToken: 'spaceradio_refresh_token',
  timestamp: 'spaceradio_timestamp',
  userID: 'spaceradio_user_id',
  name: 'spaceradio_user_display_name',
  image: 'spaceradio_user_images',
  plan: 'spaceradio_user_product',
}

export const usePersonalStore = defineStore('PersonalStore', {
  state: () => ({
    access_token: localStorage.getItem(storageKeys.token) || '',
    expires_in: Number(localStorage.getItem(storageKeys.expiredTime)) || null,
    refresh_token: localStorage.getItem(storageKeys.refreshToken) || null,
    timestamp: Number(localStorage.getItem(storageKeys.timestamp)) || NaN,

    id: localStorage.getItem(storageKeys.userID) || '',
    display_name: localStorage.getItem(storageKeys.name) || '',
    image_url: localStorage.getItem(storageKeys.image) || '',
    product: localStorage.getItem(storageKeys.plan) || '',
  }),
  getters: {
    isTokenValid: state => () => {
      if (!state.expires_in) return false
      const now = Date.now()
      return state.expires_in * 1000 + state.timestamp > now
    },
    isPremium: state => state.product === 'premium',
  },
  actions: {
    updateToken(params: { access_token: string; expires_in: number; refresh_token: string }) {
      this.$patch(params)
      this.timestamp = Date.now()
      localStorage.setItem(storageKeys.token, this.access_token)
      localStorage.setItem(storageKeys.timestamp, this.timestamp.toString())
      localStorage.setItem(storageKeys.expiredTime, this.expires_in!.toString())
      localStorage.setItem(storageKeys.refreshToken, this.refresh_token!)
      return Promise.resolve(params)
    },
    updateUserData({ id, display_name, images, product }: SpotifyApi.CurrentUsersProfileResponse) {
      this.$patch({ id, display_name, product })
      localStorage.setItem(storageKeys.userID, this.id)
      localStorage.setItem(storageKeys.name, this.display_name)
      localStorage.setItem(storageKeys.plan, this.product)

      if (images && images.length > 0) {
        this.image_url = images[0].url
        localStorage.setItem(storageKeys.image, images[0].url)
      }
    },
    clear() {
      localStorage.clear()
      this.$reset()
    },
  },
})
