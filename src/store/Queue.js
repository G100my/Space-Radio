import { spotifyAPI } from '../utility/spotify-web-api.js'
import firebase from './firebase.js'

let urgent_queue_ref
let normal_queue_ref
let pending_queue_ref

function setQueueRef(roomKey) {
  urgent_queue_ref = firebase.database().ref(`${roomKey}/urgent_queue`)
  normal_queue_ref = firebase.database().ref(`${roomKey}/normal_queue`)
  pending_queue_ref = firebase.database().ref(`${roomKey}/pending_queue`)
}

function bindListener(target, storeTarget, store) {
  target.on('child_removed', oldChildSnapshot => {
    store.commit('deleteQueueTrack', { storeTarget, oldChildSnapshot })
  })
  target.on('child_added', childSnapshot => {
    const trackId = childSnapshot.val().id
    if (store.getters.previousDeleted && store.getters.previousDeleted.id === trackId) {
      store.commit('addQueueTrack', { storeTarget, childSnapshot, addedTrack: store.getters.previousDeleted })
      store.commit('clearPreviousDeleted')
      return
    }
    if (spotifyAPI.getAccessToken()) {
      spotifyAPI.getTrack(trackId).then(addedTrack => {
        store.commit('addQueueTrack', { storeTarget, childSnapshot, addedTrack })
      })
    } else {
      console.warn('spotifyAPI.getAccessToken() is ' + spotifyAPI.getAccessToken())
    }
  })
  target.on('child_changed', childSnapshot => {
    store.commit('editQueue', { storeTarget, childSnapshot })
  })
}

function queueConnect2firebase(store) {
  bindListener(normal_queue_ref, 'normal', store)
  bindListener(urgent_queue_ref, 'urgent', store)
  pending_queue_ref.on('value', snapshot => {
    if (!snapshot.val()) {
      store.commit('clearPendingQueue')
      return
    }

    const trackId = snapshot.val().id
    if (store.getters.previousDeleted && store.getters.previousDeleted.id === trackId) {
      store.commit('refreshPendingTrack', store.getters.previousDeleted)
      store.commit('refreshPendingQueue', snapshot.val())
      store.commit('clearPreviousDeleted')
      return
    } else if (spotifyAPI.getAccessToken())
      spotifyAPI.getTrack(trackId).then(addedTrack => {
        store.commit('refreshPendingTrack', addedTrack)
        store.commit('refreshPendingQueue', snapshot.val())
      })
  })
}

const Queue = {
  state: {
    normal_queue: {},
    urgent_queue: {},
    pending_queue: null,
    trackData: {
      pending: null,
    },
    previousDeleted: null,
  },
  getters: {
    trackData(state) {
      return state.trackData
    },
    pendingQueue(state) {
      return state.pending_queue
    },
    normalQueue(state) {
      return state.normal_queue
    },
    urgentQueue(state) {
      return state.urgent_queue
    },
    previousDeleted(state) {
      return state.previousDeleted
    },
    leftQueueAmount(state) {
      const urgentQueueArray = Object.keys(state.urgent_queue)
      const normalQueueArray = Object.keys(state.normal_queue)
      return urgentQueueArray.length + normalQueueArray.length
    },
    pendingNote(state) {
      return state.pending_queue ? state.pending_queue.note : null
    },
  },
  mutations: {
    clearPreviousDeleted(state) {
      state.previousDeleted = null
    },
    clearPendingQueue(state) {
      state.pending_queue = null
      delete state.trackData.pending
    },
    deleteQueueTrack(state, { storeTarget, oldChildSnapshot }) {
      const queueKey = oldChildSnapshot.key
      state.previousDeleted = state.trackData[queueKey]
      delete state.trackData[queueKey]
      delete state[`${storeTarget}_queue`][queueKey]
    },
    addQueueTrack(state, { storeTarget, childSnapshot, addedTrack }) {
      const queueKey = childSnapshot.key
      state[`${storeTarget}_queue`][queueKey] = childSnapshot.val()
      state.trackData[queueKey] = addedTrack
    },
    editQueue(state, { storeTarget, childSnapshot }) {
      const queueKey = childSnapshot.key
      state[`${storeTarget}_queue`][queueKey] = childSnapshot.val()
    },
    refreshPendingQueue(state, queue) {
      state.pending_queue = queue
    },
    refreshPendingTrack(state, track) {
      state.trackData.pending = track
    },
  },
  actions: {
    add({ getters }, { id, note, trackNameForLog: track_name }) {
      const now = Date.now()
      const parameter = {}
      const userId = getters.userId
      const orderKey = `${now}-${userId}`
      parameter[orderKey] = {
        id,
        added_time: now,
        added_by: userId,
        note,
        track_name,
      }
      normal_queue_ref.update(parameter)
    },
    jumpIn({ getters }, { id, note, trackNameForLog: track_name }) {
      const now = Date.now()
      const userId = getters.userId
      urgent_queue_ref.push({
        id,
        added_time: now,
        added_by: userId,
        note,
        track_name,
      })
    },
    urgentRemove(_context, { queueKey }) {
      urgent_queue_ref.child(queueKey).remove()
    },
    normalRemove(_context, { queueKey }) {
      normal_queue_ref.child(queueKey).remove()
    },

    urgent2normal({ state }, { queueKey }) {
      const queue = { ...state.urgent_queue[queueKey] }
      queue.note = false
      const orderKey = `${queue.added_time}-${queue.added_by}`

      const parameter = {}
      parameter[orderKey] = queue

      urgent_queue_ref
        .child(queueKey)
        .remove()
        .then(() => {
          normal_queue_ref.update(parameter)
        })
    },

    normal2urgent({ state }, { queueKey, note }) {
      const queue = { ...state.normal_queue[queueKey] }
      queue.note = note

      normal_queue_ref
        .child(queueKey)
        .remove()
        .then(() => {
          urgent_queue_ref.push(queue)
        })
    },

    urgentEdit(_context, { queueKey, note }) {
      urgent_queue_ref.child(queueKey).update({ note })
    },
    sendNextQueue({ state }, callback) {
      const urgentQueueArray = Object.keys(state.urgent_queue)
      let nextQueueKey, level
      if (urgentQueueArray.length === 0) {
        const normalQueneArray = Object.keys(state.normal_queue)
        if (normalQueneArray.length === 0) {
          console.warn('已經沒有任何點播了~~')
          // set it 'false' to keep it exist
          pending_queue_ref.set(null)
          return
        } else {
          nextQueueKey = normalQueneArray[0]
          level = 'normal'
        }
      } else {
        nextQueueKey = urgentQueueArray[0]
        level = 'urgent'
      }

      spotifyAPI.queue(`spotify:track:${state[`${level}_queue`][nextQueueKey].id}`, error => {
        error && console.log(error)
        if (!error) {
          const queue = state[`${level}_queue`][nextQueueKey]

          let targetQueue
          if (level === 'urgent') {
            targetQueue = urgent_queue_ref
          } else {
            targetQueue = normal_queue_ref
          }
          targetQueue
            .child(nextQueueKey)
            .remove()
            .then(() => {
              pending_queue_ref.set(queue)
            })
          if (callback) callback()
        }
      })
    },
    clearPendingQueue() {
      pending_queue_ref.set(null)
    },
  },
}

export { Queue, queueConnect2firebase, setQueueRef }
