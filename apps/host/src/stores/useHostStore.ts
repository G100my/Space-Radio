import type { SiteSettings, SpaceClientData, CustomAuth } from 'shared'
import { defineStore } from 'pinia'
import { auth, db } from '@/plugins/firebase'
import { push, equalTo, ref, remove, set, update, query, get } from 'firebase/database'
import { getFCMtoken } from '@/sw/utils'

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
    clientUrl: state => `${baseUrl}/${state.settings?.space_name ?? state.hostUid}`,
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
    async updateAuth(spotifyAuth: CustomAuth) {
      await this.checkUid()
      set(ref(db, `/${this.hostUid}/auth`), { ...spotifyAuth, timestamp: Date.now() })
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
    // subscribe
    async recordFCMtoken() {
      await this.checkUid()
      const token = await getFCMtoken()
      push(ref(db, `/${this.hostUid}/messaging_tokens`), {
        // @ts-ignore
        device_name: navigator.userAgentData?.platform as string,
        token,
      })
    },
    // unsubscribe
    async removeFCMtoken() {
      await this.checkUid()
      const token = await getFCMtoken()
      const filtered = query(ref(db, `/${this.hostUid}/messaging_tokens`), equalTo(token, 'token'))
      const snapshot = await get(filtered)
      if (snapshot.exists() && snapshot.hasChildren()) {
        snapshot.forEach(child => {
          if (child.val().token === token) remove(child.ref)
        })
      }
    },
    async checkSubscribeStatus() {
      await this.checkUid()
      const currentToken = await getFCMtoken()
      const filtered = query(ref(db, `/${this.hostUid}/messaging_tokens`), equalTo(currentToken, 'token'))
      const snapshot = await get(filtered)
      return snapshot.exists()
    },
  },
})
