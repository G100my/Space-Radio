import { spotifyAPI } from '@/plugins/spotifyAPI'
import firebase from '../plugins/firebase'
import { useNoteStore, type Note } from './NoteStore'
import { defineStore } from 'pinia'
import { usePersonalStore } from '@/store'
import { useLatestOrderStore } from './PlayingStateStore'

type storeNames = 'urgent' | 'normal' | 'pending'

let urgent_queue_ref: firebase.database.Reference
let normal_queue_ref: firebase.database.Reference
let pending_queue_ref: firebase.database.Reference

function setQueueRef(roomKey: string) {
  urgent_queue_ref = firebase.database().ref(`${roomKey}/urgent_queue`)
  normal_queue_ref = firebase.database().ref(`${roomKey}/normal_queue`)
  pending_queue_ref = firebase.database().ref(`${roomKey}/pending_queue`)
}

function bindListener(
  target: firebase.database.Reference,
  storeTarget: storeNames,
  store: ReturnType<typeof useQueueStore>
) {
  target.on('child_removed', childSnapshot => {
    store._deleteOrder(storeTarget, childSnapshot)
  })
  target.on('child_added', childSnapshot => {
    store._addOrder(storeTarget, childSnapshot)
  })
  target.on('child_changed', childSnapshot => {
    store._editOrder(storeTarget, childSnapshot)
  })
}

export interface Order {
  id: string
  orderer_id: string
  orderer_name: string
  track_name: string
  track_id: string
  note: Note | false
}

const orderMaker = (params: Omit<Order, 'id' | 'note'> & { id?: Order['id']; note?: Order['note'] }): Order => {
  if (!params.id) {
    params.id = `${Date.now().toString()}-${Math.floor(Math.random() * 10000).toString(16)}`
  }
  return params as Order
}

function queueConnect2firebase() {
  const queueStore = useQueueStore()
  bindListener(normal_queue_ref, 'normal', queueStore)
  bindListener(urgent_queue_ref, 'urgent', queueStore)
  bindListener(pending_queue_ref, 'pending', queueStore)
}

type State = Record<'normal_queue' | 'urgent_queue' | 'pending_queue', { [key: string]: Order }> & {
  trackData: { [key: string]: SpotifyApi.SingleTrackResponse }
  previousDeleted: SpotifyApi.SingleTrackResponse | null
  previousDeletedKey: string | null
}

export const useQueueStore = defineStore('QueueStore', {
  state: (): State => ({
    normal_queue: {},
    urgent_queue: {},
    pending_queue: {},
    trackData: {},
    previousDeleted: null,
    previousDeletedKey: null,
  }),
  getters: {
    pendingOrder(state) {
      const pending = Object.values(state.pending_queue)
      return pending.length ? pending[0] : null
    },
    totalQueue(state) {
      const pending = state.pending_queue
      const normal = state.normal_queue
      const urgent = state.urgent_queue
      return Object.assign({}, pending, urgent, normal)
    },
    leftQueueAmount(state) {
      const urgentQueueArray = Object.keys(state.urgent_queue)
      const normalQueueArray = Object.keys(state.normal_queue)
      return urgentQueueArray.length + normalQueueArray.length
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
  },
  actions: {
    _clearPreviousDeleted() {
      this.previousDeleted = null
      this.previousDeletedKey = null
    },
    _deleteOrder(storeTarget: storeNames, childSnapshot: firebase.database.DataSnapshot) {
      const key = childSnapshot.key
      if (!key) throw new Error('key is not exist, _deleteOrder')
      this.previousDeleted = this.trackData[key]
      delete this.trackData[key]
      delete this[`${storeTarget}_queue`][key]
    },
    _addTrack(key: string, addedTrack: SpotifyApi.SingleTrackResponse) {
      this.trackData[key] = addedTrack
    },
    _editOrder(storeTarget: storeNames, childSnapshot: firebase.database.DataSnapshot) {
      if (childSnapshot.key === null) throw new Error('childSnapshot.key is null.')
      this[`${storeTarget}_queue`][childSnapshot.key] = orderMaker(childSnapshot.val())
    },

    _addOrder(storeTarget: storeNames, childSnapshot: firebase.database.DataSnapshot) {
      const order = orderMaker(childSnapshot.val())
      const trackId = order.track_id
      const key = childSnapshot.key

      if (!key) throw new Error('key is not exist.')

      if (this.previousDeleted && this.previousDeleted.id === trackId) {
        this[`${storeTarget}_queue`][key] = order
        this.trackData[key] = this.previousDeleted
        this._clearPreviousDeleted()
      } else {
        spotifyAPI
          .getTrack(trackId)
          .then(addedTrack => {
            this[`${storeTarget}_queue`][key] = order
            this.trackData[key] = addedTrack
          })
          .catch(e => {
            console.error(e, `trackId: ${trackId}`)
          })
      }
    },
    add(track_id: string, track_name: string) {
      const personalStore = usePersonalStore()
      const orderer_id = personalStore.id
      const orderer_name = personalStore.display_name
      const order = orderMaker({ track_id, track_name, orderer_id, orderer_name })
      normal_queue_ref.child(order.id).update(order)
    },
    jumpIn(track_id: string, track_name: string) {
      const noteStore = useNoteStore()
      const handler = (note: Note) => {
        const personalStore = usePersonalStore()
        const orderer_name = personalStore.display_name
        const orderer_id = personalStore.id
        urgent_queue_ref.push(orderMaker({ track_id, track_name, note, orderer_name, orderer_id }))
        noteStore.isDialogOpen = false
        noteStore.recordSenderNameInLocal()
      }
      noteStore.clearNote()
      noteStore.noteTrackName = track_name
      noteStore.isDialogOpen = true
      noteStore.submitHandler = handler
    },
    addMultiple(ids: string[], names: string[]) {
      const personalStore = usePersonalStore()
      const orderer_name = personalStore.display_name
      const orderer_id = personalStore.id
      const parameter = ids.reduce<State['normal_queue']>((accumulator, track_id, index) => {
        const id = `${Date.now()}-${index}`
        accumulator[id] = orderMaker({
          track_id,
          track_name: names[index],
          orderer_id,
          orderer_name,
          id,
        })
        return accumulator
      }, {})
      normal_queue_ref.update(parameter)
    },
    urgentRemove(orderId: string) {
      urgent_queue_ref.child(orderId).remove()
    },
    normalRemove(orderId: string) {
      normal_queue_ref.child(orderId).remove()
    },

    urgent2normal(orderId: string) {
      const urgentOrder = this.urgent_queue[orderId]
      const normalOrder = orderMaker({ ...urgentOrder, note: false })

      urgent_queue_ref
        .child(orderId)
        .remove()
        .then(() => {
          normal_queue_ref.child(normalOrder.id).update(normalOrder)
        })
    },

    normal2urgent(orderId: string) {
      const noteStore = useNoteStore()
      const handler = (note: Note) => {
        const queue = orderMaker({ ...this.normal_queue[orderId], note })
        normal_queue_ref
          .child(orderId)
          .remove()
          .then(() => {
            urgent_queue_ref.push(queue)
          })
        noteStore.isDialogOpen = false
      }
      noteStore.clearNote()
      noteStore.isDialogOpen = true
      noteStore.submitHandler = handler
    },
    urgentEdit(orderId: string) {
      const noteStore = useNoteStore()
      const handler = (newNote: Note) => {
        urgent_queue_ref.child(orderId).update({ note: newNote })
        noteStore.recordSenderNameInLocal()
        noteStore.isDialogOpen = false
      }
      const oldNote = this.urgent_queue[orderId].note
      noteStore.updateEditingNote(oldNote)
      noteStore.submitHandler = handler
      noteStore.isDialogOpen = true
    },
    nextWithAddToPending() {
      const result = this._nextOrder
      if (!result) return Promise.reject()
      const { currentOrderId, targetQueue, order } = result

      return spotifyAPI.queue(`spotify:track:${order.track_id}`).then(() => {
        if (targetQueue === 'urgent_queue') {
          this.urgentRemove(currentOrderId)
        } else {
          this.normalRemove(currentOrderId)
        }
        const latestOrderStore = useLatestOrderStore()
        latestOrderStore.updateTheLatestOrder(order)
        return { currentOrderId, targetQueue, order }
      })
    },
    _addPendingQueue(currentOrderId: string, order: Order) {
      return pending_queue_ref.child(currentOrderId).set(order)
    },
    sendNextQueue() {
      return this.nextWithAddToPending().then(({ order, currentOrderId }) => {
        this._addPendingQueue(currentOrderId, order)
        this.previousDeletedKey = currentOrderId
      })
    },
    clearPendingQueue() {
      pending_queue_ref.set(null)
    },
  },
})

export { queueConnect2firebase, setQueueRef }
