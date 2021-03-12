import firebase from './firebase.js'

const FirebaseRef = {
  state: {
    playing_state_ref: null,
    user_log_ref: null,
    urgent_queue_ref: null,
    normal_queue_ref: null,
    pending_queue_ref: null,
  },
  getters: {
    playing_state_ref(state) {
      return state.playing_state_ref
    },
    user_log_ref(state) {
      return state.user_log_ref
    },
    urgent_queue_ref(state) {
      return state.urgent_queue_ref
    },
    normal_queue_ref(state) {
      return state.normal_queue_ref
    },
    pending_queue_ref(state) {
      return state.pending_queue_ref
    },
  },
  mutations: {
    setRootRef(state, roomKey) {
      for (let ref in state) {
        state[ref] = firebase.database().ref(`${roomKey}/${ref.slice(0, -4)}`)
      }
    },
  },
}

export { FirebaseRef }
