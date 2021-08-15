import { spotifyAPI } from '../utility/spotifyAPI.js'
import firebase from './firebase.js'
import { Order } from '@/prototype/Order.js'

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
    store.commit('_deleteOrder', { storeTarget, oldChildSnapshot })
  })
  target.on('child_added', childSnapshot => {
    const order = new Order(childSnapshot.val())
    const trackId = order.track_id
    if (store.getters.previousDeleted && store.getters.previousDeleted.id === trackId) {
      store.commit('_addOrder', { storeTarget, order, addedTrack: store.getters.previousDeleted })
      store.commit('_clearPreviousDeleted')
      return
    }
    if (spotifyAPI.getAccessToken()) {
      spotifyAPI
        .getTrack(trackId)
        .then(addedTrack => {
          store.commit('_addOrder', { storeTarget, order, addedTrack })
        })
        .catch(e => {
          console.error(e, `trackId: ${trackId}`)
        })
    } else {
      console.warn('spotifyAPI.getAccessToken() is ' + spotifyAPI.getAccessToken())
    }
  })
  target.on('child_changed', childSnapshot => {
    store.commit('_editOrder', { storeTarget, order: new Order(childSnapshot) })
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
}

const mutations = {
  _clearPreviousDeleted(state) {
    state.previousDeleted = null
    state.previousDeletedKey = null
  },
  clearPendingQueue(state) {
    state.pending_queue = {}
  },
  _deleteOrder(state, { storeTarget, order }) {
    state.previousDeleted = state.trackData[order.id]
    delete state.trackData[order.id]
    delete state[`${storeTarget}_queue`][order.id]
  },
  _addOrder(state, { storeTarget, order, addedTrack }) {
    const orderId = order.id
    state[`${storeTarget}_queue`][orderId] = order
    state.trackData[orderId] = addedTrack
  },
  _editOrder(state, { storeTarget, order }) {
    state[`${storeTarget}_queue`][order.id] = order
  },
}

const actions = {
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
  sendNextQueue({ state }, callback) {
    let nextOrderId, level
    const urgentQueueIds = Object.keys(state.urgent_queue)
    const normalQueneIds = Object.keys(state.normal_queue)
    if (urgentQueueIds.length) {
      nextOrderId = urgentQueueIds[0]
      level = 'urgent'
    } else if (normalQueneIds.length) {
      nextOrderId = normalQueneIds[0]
      level = 'normal'
    } else {
      console.warn('已經沒有任何點播了~~')
      pending_queue_ref.set(null)
      // fixme
      return
    }

    state.previousDeletedKey = nextOrderId

    spotifyAPI.queue(`spotify:track:${state[`${level}_queue`][nextOrderId].track_id}`, error => {
      if (error) {
        console.error(error)
        return
      }

      const order_key = nextOrderId
      const queue = {}
      queue[nextOrderId] = { ...state[`${level}_queue`][nextOrderId], order_key }

      let targetQueue
      if (level === 'urgent') {
        targetQueue = urgent_queue_ref
      } else {
        targetQueue = normal_queue_ref
      }
      targetQueue
        .child(nextOrderId)
        .remove()
        .then(() => {
          pending_queue_ref.set(queue)
        })
      if (callback) callback()
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
