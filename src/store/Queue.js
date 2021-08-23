import { spotifyAPI } from '../utility/spotifyAPI.js'
import firebase from './firebase.js'
import { Order } from '@/prototype/Order.js'

let urgent_queue_ref = {}
let normal_queue_ref = {}
let pending_queue_ref = {}

function setQueueRef(roomKey) {
  urgent_queue_ref = firebase.database().ref(`${roomKey}/urgent_queue`)
  normal_queue_ref = firebase.database().ref(`${roomKey}/normal_queue`)
  pending_queue_ref = firebase.database().ref(`${roomKey}/pending_queue`)
}

function bindListener(target, storeTarget, store) {
  target.on('child_removed', childSnapshot => {
    store.commit('_deleteOrder', { storeTarget, childSnapshot })
  })
  target.on('child_added', childSnapshot => {
    store.dispatch('_addOrder', { storeTarget, childSnapshot })
  })
  target.on('child_changed', childSnapshot => {
    store.commit('_editOrder', { storeTarget, childSnapshot })
  })
}

function queueConnect2firebase(store) {
  bindListener(normal_queue_ref, 'normal', store)
  bindListener(urgent_queue_ref, 'urgent', store)
  bindListener(pending_queue_ref, 'pending', store)
}

const state = {
  normal_queue: {},
  urgent_queue: {},
  pending_queue: {},
  trackData: {},
  previousDeleted: null,
  previousDeletedKey: null,
}
const getters = {
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
  _nextOrder(state) {
    const urgentQueueIds = Object.keys(state.urgent_queue)
    const normalQueneIds = Object.keys(state.normal_queue)
    // currentOrderId: urgent_queue order id is different
    if (urgentQueueIds.length) {
      return {
        currentOrderId: urgentQueueIds[0],
        targetQueue: 'urgent_queue',
        order: state.urgent_queue[urgentQueueIds[0]],
      }
    } else if (normalQueneIds.length) {
      return {
        currentOrderId: normalQueneIds[0],
        targetQueue: 'normal_queue',
        order: state.normal_queue[normalQueneIds[0]],
      }
    } else {
      console.warn('已經沒有任何點播了~~')
      pending_queue_ref.set(null)
      // fixme
      return false
    }
  },
}

const mutations = {
  _clearPreviousDeleted(state) {
    state.previousDeleted = null
    state.previousDeletedKey = null
  },
  clearPendingQueue(state) {
    state.pending_queue = {}
  },
  _deleteOrder(state, { storeTarget, childSnapshot }) {
    state.previousDeleted = state.trackData[childSnapshot.key]
    delete state.trackData[childSnapshot.key]
    delete state[`${storeTarget}_queue`][childSnapshot.key]
  },
  _addOrder(state, { key, order, storeTarget }) {
    state[`${storeTarget}_queue`][key] = order
  },
  _addTrack(state, { key, addedTrack }) {
    state.trackData[key] = addedTrack
  },
  _editOrder(state, { storeTarget, childSnapshot }) {
    state[`${storeTarget}_queue`][childSnapshot.key] = new Order(childSnapshot)
  },
}

const actions = {
  _addOrder({ getters, commit }, { storeTarget, childSnapshot }) {
    const order = new Order(childSnapshot.val())
    const trackId = order.track_id
    const key = storeTarget === 'urgent' ? childSnapshot.key : order.id

    if (getters.previousDeleted && getters.previousDeleted.id === trackId) {
      commit('_addOrder', { storeTarget, order, key })
      commit('_addTrack', { key, addedTrack: getters.previousDeleted })
      commit('_clearPreviousDeleted')
    } else {
      spotifyAPI
        .getTrack(trackId)
        .then(addedTrack => {
          commit('_addOrder', { storeTarget, order, key })
          commit('_addTrack', { key, addedTrack })
        })
        .catch(e => {
          console.error(e, `trackId: ${trackId}`)
        })
    }
  },
  add({ getters }, { id: track_id, track_name }) {
    const orderer_id = getters.userId
    const orderer_name = getters.userName
    const order = new Order({ track_id, track_name, orderer_id, orderer_name })
    normal_queue_ref.child(order.id).update(order)
  },
  jumpIn({ getters, commit, dispatch }, { id: track_id, track_name }) {
    function handler(note) {
      const orderer_name = getters.userName
      const orderer_id = getters.userId
      urgent_queue_ref.push(new Order({ track_id, track_name, note, orderer_name, orderer_id }))
      commit('noteDialogToggler', false)
      commit('_refreshLocalSenderName')
    }
    dispatch('_clearNote')
    commit('noteDialogToggler', true)
    commit('_refreshHandler', handler)
  },
  addMultiple({ getters }, { ids, names }) {
    const orderer_name = getters.userName
    const orderer_id = getters.userId
    const now = Date.now()
    const parameter = ids.reduce((accumulator, track_id, index) => {
      const id = `${now}-${index}`
      accumulator[id] = new Order({
        track_id,
        track_name: names[index],
        orderer_id,
        orderer_name,
        id,
      })
    }, {})
    normal_queue_ref.update(parameter)
  },
  urgentRemove(_context, orderId) {
    urgent_queue_ref.child(orderId).remove()
  },
  normalRemove(_context, orderId) {
    normal_queue_ref.child(orderId).remove()
  },

  urgent2normal({ state }, orderId) {
    const urgentOrder = state.urgent_queue[orderId]
    const normalOrder = new Order({ ...urgentOrder, note: false })

    urgent_queue_ref
      .child(orderId)
      .remove()
      .then(() => {
        normal_queue_ref.child(normalOrder.id).update(normalOrder)
      })
  },

  normal2urgent({ state, commit, dispatch }, orderId) {
    function handler(note) {
      const queue = new Order({ ...state.normal_queue[orderId], note })
      normal_queue_ref
        .child(orderId)
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
  urgentEdit({ commit, state }, orderId) {
    function handler(newNote) {
      urgent_queue_ref.child(orderId).update({ note: newNote })
      commit('_refreshLocalSenderName')
      commit('noteDialogToggler', false)
    }
    const oldNote = state.urgent_queue[orderId].note
    commit('refreshNote', oldNote)
    commit('_refreshHandler', handler)
    commit('noteDialogToggler', true)
  },
  sendNextQueue({ state, getters, dispatch }, callback) {
    const result = getters._nextOrder
    if (!result) return
    const { currentOrderId, targetQueue, order } = result

    state.previousDeletedKey = currentOrderId
    spotifyAPI.queue(`spotify:track:${order.track_id}`, error => {
      if (error) {
        console.error(error)
        return
      }

      if (targetQueue === 'urgent_queue') {
        dispatch('urgentRemove', currentOrderId)
      } else {
        dispatch('normalRemove', currentOrderId)
      }
      dispatch('_addPendingQueue', { order, currentOrderId })

      if (callback) callback()
    })
  },
  clearPendingQueue() {
    pending_queue_ref.set(null)
  },
  _addPendingQueue(_context, { currentOrderId, order }) {
    return pending_queue_ref.child(currentOrderId).set(order)
  },
}

const Queue = {
  state,
  getters,
  mutations,
  actions,
}

export { Queue, queueConnect2firebase, setQueueRef }

// for test
export { state, getters, mutations, actions, normal_queue_ref, urgent_queue_ref, pending_queue_ref }
