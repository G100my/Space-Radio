import { defineStore } from 'pinia'

function randomKeyMaker() {
  return Math.floor(Math.random() * 1000)
}

interface AlertItem {
  error: boolean
  message: string
  randomKey: number
}

export const useAlertStore = defineStore('AlertStore', {
  state: (): { items: AlertItem[] } => ({
    items: [],
  }),
  actions: {
    alertTimeout(randomKey: number) {
      setTimeout(() => {
        const index = this.items.findIndex(item => item.randomKey === randomKey)
        if (index !== -1) this.items.splice(index, 1)
      }, 7000)
    },
    pushAlert(message: string, isError: boolean = false) {
      const randomKey = randomKeyMaker()
      this.items.push({ error: isError, message, randomKey })
      this.alertTimeout(randomKey)
    },
    closeAlert(index: number) {
      this.items.splice(index, 1)
    },
  },
})
