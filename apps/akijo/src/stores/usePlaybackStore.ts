import { clientApi } from '@/api/cloudFunctionAPI'
import { defineStore } from 'pinia'

interface State {
  current: Awaited<ReturnType<typeof clientApi.getCurrentPlaying>>
}

export default defineStore('playback', {
  state: (): State => ({
    current: null,
  }),
  actions: {
    judgeDisableGetCurrentPlaying() {
      const disableGetCurrentPlaying = !this.current
        ? false
        : this.current.timestamp - this.current.progress_ms + this.current.item.duration_ms > Date.now()

      return disableGetCurrentPlaying
    },
    getCurrentPlaying(space: string) {
      if (this.judgeDisableGetCurrentPlaying()) {
        return Promise.reject('getCurrentPlaying is disabled.')
      }

      return clientApi
        .getCurrentPlaying(space)
        .then(res => {
          this.current = res
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
