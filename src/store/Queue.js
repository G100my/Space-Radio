import { spotifyAPI } from '../plugin/spotify-web-api.js'
import firebase from './firebase.js'

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

const urgent_queue_ref = firebase.database().ref('urgent_queue')
const normal_queue_ref = firebase.database().ref('normal_queue')
const pending_queue_ref = firebase.database().ref('pending_queue')

const Queue = {
  state: {
    normal_queue: {},
    urgent_queue: {},
    pending_queue: {},
    trackData: {},
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
    normalQueueKeys(state) {
      return Object.keys(state.normal_queue)
    },
    urgentQueueKeys(state) {
      return Object.keys(state.urgent_queue)
    },
    previousDeleted(state) {
      return state.previousDeleted
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
    clearPreviousDeleted(state) {
      state.previousDeleted = null
    },
    clearPendingQueue(state) {
      state.pending_queue = null
    },
    deleteQueueTrack(state, { storeTarget, oldChildSnapshot }) {
      const queueKey = oldChildSnapshot.key
      state.previousDeleted = state[`${storeTarget}_queue`][queueKey]
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
    refreshPending(state, queue) {
      state.pending_queue = queue
      state.trackData['pending'] = state.previousDeleted
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
      const queue = { ...context.state.trackData[queueKey] }
      queue.note = false
      const orderKey = queue.orderKey

      const parameter = {}
      parameter[orderKey] = queue

      urgent_queue_ref
        .child(queueKey)
        .remove()
        .then(() => {
          normal_queue_ref.update(parameter)
        })
    },

    normal2urgent(context, { queueKey, note }) {
      const queue = { ...context.state.trackData[queueKey] }
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
    normalEdit(_context, { queueKey, note }) {
      normal_queue_ref.child(queueKey).update({ note })
    },
    sendNextQueue({ state, dispatch }) {
      const urgentQueueArray = Object.keys(state.urgent_queue)
      let nextQueueKey, level
      if (urgentQueueArray.length === 0) {
        const normalQueneArray = Object.keys(state.normal_queue)
        if (normalQueneArray.length === 0) {
          console.warn('已經沒有任何點播了~~')
          pending_queue_ref.set(false)
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
          pending_queue_ref.set(state[`${level}_queue`][nextQueueKey])
          dispatch(`${level}Remove`, nextQueueKey)
        }
      })
    },
  },
}

function connect2FirebaseQueue(store) {
  bindListener(normal_queue_ref, 'normal', store)
  bindListener(urgent_queue_ref, 'urgent', store)
  pending_queue_ref.on('value', snapshot => {
    console.log(snapshot.val())

    if (snapshot.val() === null) {
      store.commit('clearPendingQueue')
      return
    }

    const trackId = snapshot.val().id
    if (store.getters.previousDeleted && store.getters.previousDeleted.id === trackId) {
      store.commit('refreshPending', snapshot.val())
      store.commit('clearPreviousDeleted')
      console.log('YAYAYA')
      return
    }

    if (spotifyAPI.getAccessToken())
      spotifyAPI.getTrack(trackId).then(addedTrack => {
        store.commit('refreshPending', addedTrack)
      })
  })
}

export { Queue, connect2FirebaseQueue }
