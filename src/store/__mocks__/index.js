const state = {
  counter: 0,
}
const getters = {
  counter(state) {
    return state.counter
  },
  pendingQueue: {},
}
const mutations = {}
const actions = {
  sendNextQueue({ state }) {
    console.log('sendNextQueue mock')
    state.counter++
  },
}
const dispatch = jest.fn(actinoType => {
  if (actinoType === 'clearPendingQueue') {
    getters.pendingQueue = {}
  }
})
export default {
  state,
  getters,
  mutations,
  actions,
  dispatch,
}
