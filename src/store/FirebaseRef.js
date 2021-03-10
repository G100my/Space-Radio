import firebase from './firebase.js'

const FirebaseRef = {
  state: {
    playing_state_ref: firebase.database().ref('plyaing_state'),
    user_log_ref: firebase.database().ref('user_log'),
    urgent_queue_ref: firebase.database().ref('urgent_queue'),
    normal_queue_ref: firebase.database().ref('normal_queue'),
    pending_queue_ref: firebase.database().ref('pending_queue'),
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
}

export { FirebaseRef }
