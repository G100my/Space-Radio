import { spotifyAPI } from '../plugin/spotify-web-api.js'
import firebase from './firebase.js'

const urgent_queue_ref = firebase.database().ref('urgent_queue')
const normal_queue_ref = firebase.database().ref('normal_queue')
const pending_queue_ref = firebase.database().ref('pending_queue')

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

function connect2FirebaseQueue(store) {
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
    // fixme
    getRoomQueueURIArray(state) {
      const normal = Object.values(state.normal_queue).map(item => 'spotify:track:'.concat(item))
      const urgent = Object.values(state.urgentQueueArray).map(item => 'spotify:track:'.concat(item))
      return urgent.concat(normal)
    },
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
    add({ getters }, { id, note }) {
      const now = Date.now()
      const parameter = {}
      const userId = getters.userId
      const orderKey = `${now}-${userId}`
      parameter[orderKey] = {
        id,
        added_time: now,
        added_by: userId,
        note,
        order_key: orderKey,
      }
      normal_queue_ref.update(parameter)
    },
    jumpIn({ getters }, { id, note }) {
      const now = Date.now()
      const userId = getters.userId
      const orderKey = `${now}-${userId}`
      urgent_queue_ref.push({
        id,
        added_time: now,
        added_by: userId,
        note,
        order_key: orderKey,
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
      const orderKey = queue.order_key

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
    sendNextQueue({ state }) {
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
          firebase
            .database()
            .ref(`${level}_queue`)
            .child(nextQueueKey)
            .remove()
            .then(() => {
              pending_queue_ref.set(queue)
            })
        }
      })
    },
    clearPendingQueue() {
      pending_queue_ref.set(null)
    },
  },
}

export { Queue, connect2FirebaseQueue }
