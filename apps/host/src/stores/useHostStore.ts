import type { SpaceClientData } from 'server/schemas'
import { defineStore } from 'pinia'

export default defineStore('host', {
  state: (): SpaceClientData => ({
    sites: {},
    settings: { top_switch: false },
    queue: {},
  }),
  getters: {
    queueAmount: (state): number | undefined => state.queue && Object.keys(state.queue).length,
  },
})
