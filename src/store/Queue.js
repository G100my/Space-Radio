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
    nextQueueKey(state) {
      const urgentQueueArray = Object.keys(state.urgent_queue)
      if (urgentQueueArray.length === 0) {
        const normalQueueArray = Object.keys(state.normal_queue)
        if (normalQueueArray.length === 0) {
          return null
        } else {
          return normalQueueArray[0]
        }
      } else {
        return urgentQueueArray[0]
      }
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
      const queueKey = oldChildSnapshot.key
      const queue = `${storeTarget}_queue`
      const track = `${storeTarget}_track`
      delete state[queue][queueKey]
      delete state[track][queueKey]
    },
    addQueueTrack(state, { storeTarget, childSnapshot, addedTrack }) {
      const queueKey = childSnapshot.key
      const queue = `${storeTarget}_queue`
      const track = `${storeTarget}_track`
      state[queue][queueKey] = childSnapshot.val()
      state[track][queueKey] = addedTrack
    },
    editQueue(state, { storeTarget, childSnapshot }) {
      const queueKey = childSnapshot.key
      const queue = `${storeTarget}_queue`
      state[queue][queueKey] = childSnapshot.val()
    },
  },
  actions: {
    add({ rootState }, { id, note }) {
      const now = Date.now()
      const parameter = {}
      const userId = rootState.Personal.userId
      const orderKey = `${now}-${userId}`
      parameter[orderKey] = {
        id,
        added_time: now,
        added_by: userId,
        note,
        orderKey,
      }
      normal_queue_ref.update(parameter)
    },
    jumpIn({ rootState }, { id, note }) {
      const now = Date.now()
      const userId = rootState.Personal.userId
      const orderKey = `${now}-${userId}`
      urgent_queue_ref.push({
        id,
        added_time: now,
        added_by: userId,
        note,
        orderKey,
      })
    },
    urgentRemove(_context, queueKey) {
      urgent_queue_ref.child(queueKey).remove()
    },
    normalRemove(_context, queueKey) {
      normal_queue_ref.child(queueKey).remove()
    },

    urgent2normal(context, queueKey) {
      const queue = { ...context.state.urgent_queue[queueKey] }
      queue.note = false
      const orderKey = queue.orderKey

      const parameter = {}
      parameter[orderKey] = queue

      normal_queue_ref.update(parameter)
      context.dispatch('urgentRemove', queueKey)
    },

    normal2urgent(context, { queueKey, note }) {
      const queue = { ...context.state.normal_queue[queueKey] }
      queue.note = note

      urgent_queue_ref.push(queue)
      context.dispatch('normalRemove', queueKey)
    },

    urgentEdit(_context, { queueKey, note }) {
      urgent_queue_ref.child(queueKey).update({ note })
    },
    normalEdit(_context, { queueKey, note }) {
      normal_queue_ref.child(queueKey).update({ note })
    },
  },
}

function connect2FirebaseQueue(store) {
  bindListener(normal_queue_ref, 'normal', store)
  bindListener(urgent_queue_ref, 'urgent', store)
}

export { Queue, connect2FirebaseQueue }
