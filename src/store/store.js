import { createStore } from 'vuex'
import firebase from './firebase.js'

// 用不一樣的命名方式做區隔
const room_queue_ref = firebase.database().ref('room_queue')
room_queue_ref.on('value', snapshot => {
  store.commit('updateRoomQueue', snapshot.val())
})

const store = createStore({
  state: {
    token: null,
    trackIdQueue: null,
  },
  getters: {
    getRoomQueueURIArray(state) {
      return Object.values(state.trackIdQueue).map(item => 'spotify:track:'.concat(item))
    },
  },
  mutations: {
    setToken(state, newToken) {
      state.token = newToken
    },
    updateRoomQueue(state, newQueue) {
      state.trackIdQueue = newQueue
    },
    room_queue_push(state, addedTrack) {
      room_queue_ref.push(addedTrack.id)
    },
    room_queue_remove_first(state) {
      const key = Object.keys(state.trackIdQueue)[0]
      room_queue_ref.child(key).remove()
    },
  },
})

export default store
