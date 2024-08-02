import { clientApi } from '@/api/cloudFunctionAPI'
import { defineStore } from 'pinia'

interface State {
  current: Awaited<ReturnType<typeof clientApi.getCurrentPlaying>>
  allowRefreshCountdown: NodeJS.Timeout | null
  allowRefresh: boolean
}

export default defineStore('playback', {
  state: (): State => ({
    current: null,
    allowRefreshCountdown: null,
    allowRefresh: true,
  }),
  actions: {
    _setCountdown() {
      if (!this.allowRefreshCountdown && this.current) {
        const offset = this.current?.item.duration_ms - this.current.progress_ms
        this.allowRefreshCountdown = setTimeout(() => {
          this.allowRefresh = true
          this.allowRefreshCountdown = null
          console.warn('allow refresh.')
        }, offset)
      }
      this.allowRefresh = !this.current ? true : !this.allowRefreshCountdown

      return this.allowRefresh
    },
    getCurrentPlaying(space: string) {
      return clientApi
        .getCurrentPlaying(space)
        .then(res => {
          this.current = res
          this._setCountdown()
        })
        .catch((error: Response) => {
          console.table(error)
          if (error.status === 400) {
            this.current = undefined
          } else console.error(error)
        })
    },
  },
})
