import { createStore } from 'vuex'

export default createStore({
  state: {
    token: null,
  },
  mutations: {
    setToken(state, newToken) {
      state.token = newToken
    },
  },
})
