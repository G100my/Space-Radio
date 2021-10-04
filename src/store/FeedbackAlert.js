function randomKeyMaker() {
  return Math.floor(Math.random() * 1000)
}

export const FeedbackAlert = {
  state: {
    feedbacks: [
      // {
      //   error: Boolean,
      //   message: '',
      //   randomKey: Number
      // }
    ],
  },
  getters: {
    feedbacks(state) {
      return state.feedbacks
    },
  },
  mutations: {
    _pushFeedback(state, payload) {
      state.feedbacks.push(payload)
    },
    _sliceFeedback(state, index) {
      state.feedbacks.splice(index, 1)
    },
  },
  actions: {
    _feedbackTimeout({ commit, state }, randomKey) {
      setTimeout(() => {
        const index = state.feedbacks.findIndex(item => item.randomKey === randomKey)
        if (index !== -1) commit('_sliceFeedback', index)
      }, 7000)
    },
    pushFeedback({ commit, dispatch }, message) {
      const randomKey = randomKeyMaker()
      commit('_pushFeedback', { error: false, message, randomKey })
      dispatch('_feedbackTimeout', randomKey)
    },
    pushErrorFeedback({ commit, dispatch }, message) {
      const randomKey = randomKeyMaker()
      commit('_pushFeedback', { error: true, message, randomKey })
      dispatch('_feedbackTimeout', randomKey)
    },
    closeFeedback({ commit }, index) {
      commit('_sliceFeedback', index)
    },
  },
}
