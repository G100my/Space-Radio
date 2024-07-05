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
    getCurrentPlaying(space: string) {
      return clientApi
        .getCurrentPlaying(space)
        .then(res => (this.current = res))
        .catch((error: Response) => {
          console.table(error)
          if (error.status === 400) {
            this.current = undefined
          } else console.error(error)
        })
    },
  },
})
