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
          console.error(e, `trackId: ${trackId}`)
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
  bindListener(pending_queue_ref, 'pending', store)
}

export function orderKeyMaker(timeString) {
  return `${timeString.toString()}-${Math.floor(Math.random() * 10000).toString(16)}`
}

export const state = {
    normal_queue: {},
    urgent_queue: {},
    pending_queue: {},
    trackData: {},
    previousDeleted: null,
    previousDeletedKey: null,
  }
export const getters = {
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
      const pending = state.pending_queue
      const normal = state.normal_queue
      const urgent = state.urgent_queue
      return Object.assign({}, pending, urgent, normal)
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
  }

export const mutations = {
    clearPreviousDeleted(state) {
      state.previousDeleted = null
      state.previousDeletedKey = null
    },
    clearPendingQueue(state) {
      state.pending_queue = {}
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
  }

export const actions = {
    add({ getters }, { id, track_name }) {
      const now = Date.now()
      const parameter = {}
      const order_key = orderKeyMaker(now)
      parameter[order_key] = {
        id,
        order_name: getters.userName,
        order_id: getters.userId,
        note: false,
        track_name,
        order_key,
      }
      normal_queue_ref.update(parameter)
    },
    jumpIn({ getters, commit, dispatch }, { id, track_name }) {
      function handler(note) {
        const now = Date.now()
        const order_key = orderKeyMaker(now)
        urgent_queue_ref.push({
          id,
          order_name: getters.userName,
          order_id: getters.userId,
          note,
          track_name,
          order_key,
        })
        commit('noteDialogToggler', false)
        commit('_refreshLocalSenderName')
      }
      dispatch('_clearNote')
      commit('noteDialogToggler', true)
      commit('_refreshHandler', handler)
    },
    addMultiple({ getters }, { ids, names }) {
      const parameter = {}
      const now = Date.now()
      ids.forEach((id, index) => {
        const order_key = `${now}-${index}`
        parameter[order_key] = {
          id,
          order_name: getters.userName,
          order_id: getters.userId,
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

    urgent2normal({ state }, key) {
      const order_key = state.urgent_queue[key].order_key
      const queue = { ...state.urgent_queue[key], note: false }

      const parameter = {}
      parameter[order_key] = queue

      urgent_queue_ref
        .child(key)
        .remove()
        .then(() => {
          normal_queue_ref.update(parameter)
        })
    },

    normal2urgent({ state, commit, dispatch }, orderKey) {
      function handler(note) {
        const queue = { ...state.normal_queue[orderKey], note }
        normal_queue_ref
          .child(orderKey)
          .remove()
          .then(() => {
            urgent_queue_ref.push(queue)
          })
        commit('noteDialogToggler', false)
      }
      dispatch('_clearNote')
      commit('noteDialogToggler', true)
      commit('_refreshHandler', handler)
    },
    urgentEdit({ commit, state }, key) {
      function handler(newNote) {
        urgent_queue_ref.child(key).update({ note: newNote })
        commit('_refreshLocalSenderName')
        commit('noteDialogToggler', false)
      }
      const oldNote = state.urgent_queue[key].note
      commit('refreshNote', oldNote)
      commit('_refreshHandler', handler)
      commit('noteDialogToggler', true)
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
      state.previousDeletedKey = nextQueueKey

      spotifyAPI.queue(`spotify:track:${state[`${level}_queue`][nextQueueKey].id}`, error => {
        error && console.error(error)
        if (!error) {
          const order_key = nextQueueKey
          const queue = {}
          queue[nextQueueKey] = { ...state[`${level}_queue`][nextQueueKey], order_key }

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
  }

const Queue = {
  state,
  getters,
  mutations,
  actions,
}

export { Queue, queueConnect2firebase, setQueueRef }
