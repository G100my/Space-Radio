import type { SiteSettings, SpaceClientData } from 'server/schemas'
import { defineStore } from 'pinia'
import { auth, db } from '@/plugins/firebase'
import { push, ref, remove, set, update } from 'firebase/database'
import type { AccessToken } from '@spotify/web-api-ts-sdk'

export default defineStore('host', {
  state: (): SpaceClientData & { space: string | undefined } => {
    const space = auth.currentUser?.uid
    return {
      sites: {},
      settings: { top_switch: false, welcome_message: '', display_name: '' },
      queue: {},

      space,
    }
  },
  getters: {
    queueAmount: (state): number | undefined => state.queue && Object.keys(state.queue).length,
  },
  actions: {
    async _checkSpace() {
      if (!this.space) {
        await auth.authStateReady()
        const space = auth.currentUser!.uid
        if (!space) throw new Error('No space name!')

        this.space = space
      }
      return this.space
    },
    async updateAuth(spotifyAuth: AccessToken) {
      await this._checkSpace()
      set(ref(db, `/${this.space}/auth`), spotifyAuth)
    },
    async updateSettings(settings: Partial<SiteSettings>) {
      await this._checkSpace()
      update(ref(db, `/${this.space}/data/settings`), settings)
    },
    async updateSites(key: string | number, siteData: { name?: string; need_review?: boolean }) {
      await this._checkSpace()
      update(ref(db, `/${this.space}/data/sites/${key}`), siteData)
    },
    async addSite(key: string) {
      await this._checkSpace()
      push(ref(db, `/${this.space}/data/sites`), { name: key, need_review: true })
    },
    async deleteSite(key: string) {
      if (!key) return
      await this._checkSpace()
      remove(ref(db, `/${this.space}/data/sites/${key}`))
    },
  },
})
