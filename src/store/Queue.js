import { spotifyAPI } from '../utility/spotifyAPI.js'
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
      spotifyAPI
        .getTrack(trackId)
        .then(addedTrack => {
          store.commit('addQueueTrack', { storeTarget, childSnapshot, addedTrack })
        })
        .catch(e => {
          console.error(e.responseText, `trackId: ${trackId}`)
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
    totalQueue(state) {
      const pending = state.pending_queue ? Object.keys(state.pending_queue) : []
      const normal = state.normal_queue ? Object.keys(state.normal_queue) : []
      const urgent = state.urgent_queue ? Object.keys(state.urgent_queue) : []
      return pending.concat(normal).concat(urgent)
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
      const orderKey = oldChildSnapshot.key
      state.previousDeleted = state.trackData[orderKey]
      delete state.trackData[orderKey]
      delete state[`${storeTarget}_queue`][orderKey]
    },
    addQueueTrack(state, { storeTarget, childSnapshot, addedTrack }) {
      const orderKey = childSnapshot.key
      state[`${storeTarget}_queue`][orderKey] = childSnapshot.val()
      state.trackData[orderKey] = addedTrack
    },
    editQueue(state, { storeTarget, childSnapshot }) {
      const orderKey = childSnapshot.key
      state[`${storeTarget}_queue`][orderKey] = childSnapshot.val()
    },
    refreshPendingQueue(state, queue) {
      state.pending_queue = queue
    },
    refreshPendingTrack(state, track) {
      state.trackData.pending = track
    },
  },
  actions: {
    add({ getters }, { id, trackNameForLog: track_name }) {
      const now = Date.now()
      const parameter = {}
      const order_key = `normal-${now}`
      parameter[order_key] = {
        id,
        added_time: now,
        orderer: getters.userName,
        note: false,
        track_name,
        order_key,
      }
      normal_queue_ref.update(parameter)
    },
    jumpIn({ getters }, { id, note, trackNameForLog: track_name }) {
      const now = Date.now()
      const order_key = `urgent-${now}`
      urgent_queue_ref.push({
        id,
        added_time: now,
        orderer: getters.userName,
        note,
        track_name,
        order_key,
      })
    },
    addMultiple({ getters }, { ids, names }) {
      const parameter = {}
      const now = Date.now()
      ids.forEach((id, index) => {
        const order_key = `normal-${now}-${index}`
        parameter[order_key] = {
          id,
          added_time: now,
          orderer: getters.userName,
          note: false,
          track_name: names[index],
          order_key,
        }
      })
      normal_queue_ref.update(parameter)
    },
    urgentRemove(_context, orderKey) {
      urgent_queue_ref.child(orderKey).remove()
    },
    normalRemove(_context, orderKey) {
      normal_queue_ref.child(orderKey).remove()
    },

    urgent2normal({ state }, { orderKey }) {
      const order_key = `normal${orderKey.slice(6)}`
      const queue = { ...state.urgent_queue[orderKey], note: false, order_key }

      const parameter = {}
      parameter[order_key] = queue

      urgent_queue_ref
        .child(orderKey)
        .remove()
        .then(() => {
          normal_queue_ref.update(parameter)
        })
    },

    normal2urgent({ state }, { orderKey, note }) {
      const order_key = `urgent${orderKey.slice(6)}`
      const queue = { ...state.normal_queue[orderKey], note, order_key }

      normal_queue_ref
        .child(orderKey)
        .remove()
        .then(() => {
          urgent_queue_ref.push(queue)
        })
    },

    urgentEdit(_context, { orderKey, note }) {
      urgent_queue_ref.child(orderKey).update({ note })
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
          const order_key = `pending-${queue.added_time}`
          const queue = { ...state[`${level}_queue`][nextQueueKey], order_key }

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
