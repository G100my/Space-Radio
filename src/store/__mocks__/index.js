import { createStore } from 'vuex'

const state = {
  counter: 0,
}
const getters = {
  counter(state) {
    return state.counter
  },
}
const mutations = {}
const actions = {
  sendNextQueue({ state }) {
    console.log('sendNextQueue mock')
    state.counter++
  },
}
export default createStore({
  state,
  getters,
  mutations,
  actions,
})
