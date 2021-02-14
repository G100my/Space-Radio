import { spotifyAPI } from '../plugin/spotify-web-api.js'
import firebase from './firebase.js'

function bindListener(target, storeTarget, store) {
  target.on('child_removed', oldChildSnapshot => {
    store.commit('deleteQueueTrack', { storeTarget, oldChildSnapshot })
  })
  target.on('child_added', childSnapshot => {
    const trackId = childSnapshot.val().id
    if (spotifyAPI.getAccessToken())
      spotifyAPI.getTrack(trackId).then(addedTrack => {
        store.commit('addQueueTrack', { storeTarget, childSnapshot, addedTrack })
      })
  })
  target.on('child_changed', childSnapshot => {
    store.commit('editQueue', { storeTarget, childSnapshot })
  })
}

const urgent_queue_ref = firebase.database().ref('urgent_queue')
const normal_queue_ref = firebase.database().ref('normal_queue')

const Queue = {
  state: {
    normal_queue: {},
    normal_track: {},
    urgent_queue: {},
    urgent_track: {},
  },
  getters: {
    // fixme
    getRoomQueueURIArray(state) {
      const normal = Object.values(state.normal_queue).map(item => 'spotify:track:'.concat(item))
      const urgent = Object.values(state.urgentQueueArray).map(item => 'spotify:track:'.concat(item))
      return urgent.concat(normal)
    },
    readyState(state) {
      return !!state.normal_track && !!state.urgent_track
    },
    normalTrackInfo(state) {
      return state.normal_track
    },
    urgentTrackInfo(state) {
      return state.urgent_track
    },
    normalQueue(state) {
      return state.normal_queue
    },
    urgentQueue(state) {
      return state.urgent_queue
    },
  },
  mutations: {
    updateQueueTrack(state, { storeTarget, newQueue, newTrack }) {
      const queueKey = `${storeTarget}_queue`
      const trackKey = `${storeTarget}_track`
      state[queueKey] = newQueue
      state[trackKey] = newTrack
    },
    deleteQueueTrack(state, { storeTarget, oldChildSnapshot }) {
      const key = oldChildSnapshot.key
      const queue = `${storeTarget}_queue`
      const track = `${storeTarget}_track`
      delete state[queue][key]
      delete state[track][key]
    },
    addQueueTrack(state, { storeTarget, childSnapshot, addedTrack }) {
      const key = childSnapshot.key
      const queue = `${storeTarget}_queue`
      const track = `${storeTarget}_track`
      state[queue][key] = childSnapshot.val()
      state[track][key] = addedTrack
    },
    editQueue(state, { storeTarget, childSnapshot }) {
      const key = childSnapshot.key
      const queue = `${storeTarget}_queue`
      state[queue][key] = childSnapshot.val()
    },
  },
  actions: {
    add({ rootState }, { id, message }) {
      const now = Date.now()
      const parameter = {}
      const userId = rootState.Personal.userId
      const orderKey = `${now}-${userId}`
      parameter[orderKey] = {
        id,
        added_time: now,
        added_by: userId,
        message,
        orderKey,
      }
      normal_queue_ref.update(parameter)
    },
    jumpIn({ rootState }, { id, message }) {
      const now = Date.now()
      const userId = rootState.Personal.userId
      const orderKey = `${now}-${userId}`
      urgent_queue_ref.push({
        id,
        added_time: now,
        added_by: userId,
        message,
        orderKey,
      })
    },
    urgentRemove(_context, key) {
      urgent_queue_ref.child(key).remove()
    },
    normalRemove(_context, key) {
      normal_queue_ref.child(key).remove()
    },

    urgent2normal(context, key) {
      const queue = { ...context.state.urgent_queue[key] }
      const orderKey = queue.orderKey

      const parameter = {}
      parameter[orderKey] = queue

      normal_queue_ref.update(parameter)
      context.dispatch('urgentRemove', key)
    },

    normal2urgent(context, { key, message }) {
      const queue = { ...context.state.normal_queue[key] }
      queue.message = message

      urgent_queue_ref.push(queue)
      context.dispatch('normalRemove', key)
    },

    urgentEdit(_context, { key, message }) {
      urgent_queue_ref.child(key).update({ message })
    },
    normalEdit(_context, { key, message }) {
      normal_queue_ref.child(key).update({ message })
    },
  },
}

function connect2FirebaseQueue(store) {
  bindListener(normal_queue_ref, 'normal', store)
  bindListener(urgent_queue_ref, 'urgent', store)
}

export { Queue, connect2FirebaseQueue }
