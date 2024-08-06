import type { SiteSettings, SpaceClientData } from 'server/schemas'
import { defineStore } from 'pinia'
import { auth, db } from '@/plugins/firebase'
import { push, ref, remove, set, update } from 'firebase/database'
import type { AccessToken } from '@spotify/web-api-ts-sdk'

const baseUrl = import.meta.env.VITE_CLIENT_URL
export default defineStore('host', {
  state: (): SpaceClientData & { hostUid: string | undefined } => {
    return {
      sites: {},
      settings: { top_switch: false, welcome_message: '', space_name: '' },
      queue: {},

      hostUid: '',
    }
  },
  getters: {
    queueAmount: (state): number | undefined => state.queue && Object.keys(state.queue).length,
    clientUrl: state => `${baseUrl}?space=${state.settings?.space_name ?? state.hostUid}`,
  },
  actions: {
    async checkUid() {
      if (!this.hostUid) {
        await auth.authStateReady()
        const uid = auth.currentUser!.uid
        if (!uid) throw new Error('No space name!')

        this.hostUid = uid
      }
      return this.hostUid
    },
    async updateAuth(spotifyAuth: AccessToken) {
      await this.checkUid()
      set(ref(db, `/${this.hostUid}/auth`), spotifyAuth)
    },
    async updateSettings(settings: Partial<SiteSettings>) {
      await this.checkUid()
      update(ref(db, `/${this.hostUid}/settings`), settings)
    },
    async updateSites(key: string | number, siteData: { name?: string; need_review?: boolean }) {
      await this.checkUid()
      update(ref(db, `/${this.hostUid}/sites/${key}`), siteData)
    },
    async addSite(key: string) {
      await this.checkUid()
      push(ref(db, `/${this.hostUid}/sites`), { name: key, need_review: true })
    },
    async deleteSite(key: string) {
      if (!key) return
      await this.checkUid()
      remove(ref(db, `/${this.hostUid}/sites/${key}`))
    },
  },
})
