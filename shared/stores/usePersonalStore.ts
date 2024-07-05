import type {} from 'spotify-web-api-js'
import type { AccessToken } from '@spotify/web-api-ts-sdk'
import { defineStore } from 'pinia'

export const storageKeys = {
  auth: 'spaceradio_auth',
  timestamp: 'spaceradio_timestamp',
  userID: 'spaceradio_user_id',
  name: 'spaceradio_user_display_name',
  image: 'spaceradio_user_images',
  plan: 'spaceradio_user_product',
}

export interface PersonalStoreState {
  auth: AccessToken | null
  timestamp: number
  id: string
  display_name: string
  image_url: string
  product: string
}

export const usePersonalStore = defineStore('personal', {
  state: (): PersonalStoreState => ({
    auth: null,
    timestamp: Number(localStorage.getItem(storageKeys.timestamp)) || NaN,
    id: localStorage.getItem(storageKeys.userID) || '',
    display_name: localStorage.getItem(storageKeys.name) || '',
    image_url: localStorage.getItem(storageKeys.image) || '',
    product: localStorage.getItem(storageKeys.plan) || '',
  }),
  getters: {
    isTokenValid: state => () => {
      if (!state.auth?.expires_in) return false
      const now = Date.now()
      console.log('🚀 ~ state.auth:', state.auth)
      return state.auth.expires_in * 1000 + state.timestamp > now
    },
    isPremium: state => state.product === 'premium',
  },
  actions: {
    updateToken(params: AccessToken) {
      this.$patch({ auth: params })
      this.timestamp = Date.now()
      localStorage.setItem(storageKeys.auth, JSON.stringify(params))
      localStorage.setItem(storageKeys.timestamp, this.timestamp.toString())
    },
    reloadToken(params: AccessToken) {
      this.$patch({ auth: params })
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
