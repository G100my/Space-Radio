import { defineStore } from 'pinia'

function randomKeyMaker() {
  return Math.floor(Math.random() * 1000)
}

interface Feedback {
  error: boolean
  message: string
  randomKey: number
}

export const useAlertStore = defineStore('AlertStore', {
  state: (): { feedbacks: Feedback[] } => ({
    feedbacks: [],
  }),
  actions: {
    _feedbackTimeout(randomKey: number) {
      setTimeout(() => {
        const index = this.feedbacks.findIndex(item => item.randomKey === randomKey)
        if (index !== -1) this.feedbacks.splice(index, 1)
      }, 7000)
    },
    pushFeedback(message: string, isError: boolean = false) {
      const randomKey = randomKeyMaker()
      this.feedbacks.push({ error: isError, message, randomKey })
      this._feedbackTimeout(randomKey)
    },
    closeFeedback(index: number) {
      this.feedbacks.splice(index, 1)
    },
  },
})
