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
    pushFeedback({ commit, state }, payload) {
      const randomKey = Math.floor(Math.random() * 1000)
      commit('_pushFeedback', { ...payload, randomKey })

      setTimeout(() => {
        const index = state.feedbacks.findIndex(item => item.randomKey === randomKey)
        if (index !== -1) commit('_sliceFeedback', index)
      }, 7000)
    },
    closeFeedback({ commit }, index) {
      commit('_sliceFeedback', index)
    },
  },
}
