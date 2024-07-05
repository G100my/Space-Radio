import type { SpaceClientData } from 'functions/src/constants'
import { defineStore } from 'pinia'

export default defineStore('host', {
  state: (): SpaceClientData => ({
    sites: {},
    settings: { all_pass: false },
    queue: {},
  }),
  getters: {
    queueAmount: (state): number | undefined => state.queue && Object.keys(state.queue).length,
  },
})
