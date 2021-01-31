import { createStore } from 'vuex'
import firebase from './firebase.js'
import { spotifyAPI } from '../plugin/spotify-web-api.js'
import { getImplicitGrantToken } from '../utility/Oauth.js'

// 用 _ 區隔 firebase 變數

function getDataHandler(snapshot, storeTarget) {
  const queue = snapshot.exportVal()
  if (queue === null) {
    console.log('queue === null')
    store.commit('updateQueueTrack', { storeTarget, newQueue: {}, newTrack: {} })
  } else if (spotifyAPI.getAccessToken()) {
    const dataArray = Object.values(queue)
    const keyArray = Object.keys(queue)
    const trackIdArray = dataArray.map(item => item.id)

    spotifyAPI.getTracks(trackIdArray).then(result => {
      // 有點冒險的作法。firebase 會把看起來像 array 的東西(例如用 push 上去的 object)自動轉換成 array 傳過來，且順序一樣。然後祈禱 spotify 回傳的順序也一樣...
      const tracks = result.tracks.reduce((previous, trackDetail, index) => {
        const key = keyArray[index]
        previous[key] = trackDetail
        return previous
      }, {})
      store.commit('updateQueueTrack', { storeTarget, newQueue: queue, newTrack: tracks })
    })
  } else {
    console.log('spotifyAPI AccessToken is null')
    getImplicitGrantToken()
  }
}

const normal_queue_ref = firebase.database().ref('normal_queue')
const urgent_queue_ref = firebase.database().ref('urgent_queue')

normal_queue_ref.orderByKey().on('value', normal_queue => {
  getDataHandler(normal_queue, 'updateNormalQueue', 'updateNormalTracks')
})
urgent_queue_ref.on('value', urgent_queue => {
  getDataHandler(urgent_queue, 'updateUrgentQueue', 'updateUrgentTracks')
})
//

const store = createStore({
  state: {
    userId: 'zhangLo',
    token: null,
    normal_queue: {},
    normal_track: {},
    urgent_queue: {},
    urgent_track: {},
    isReady: false,
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
    getNormal(state) {
      return state.normal_track
    },
    getUrgent(state) {
      return state.urgent_track
    },
  },
  mutations: {
    setToken(state, newToken) {
      state.token = newToken
    },
    updateQueueTrack(state, { storeTarget, newQueue, newTrack }) {
      console.log({ storeTarget, newQueue, newTrack })
      const queueKey = `${storeTarget}_queue`
      const trackKey = `${storeTarget}_track`
      state[queueKey] = newQueue
      state[trackKey] = newTrack
    },
  },
  actions: {
    add(context, { id, message }) {
      const now = Date.now()
      const parameter = {}
      const userId = context.state.userId
      const orderKey = `${now}-${userId}`
      parameter[orderKey] = {
        id,
        urgent_time: false,
        added_time: now,
        add_by: userId,
        message,
        orderKey,
      }
      normal_queue_ref.update(parameter)
    },
    jumpIn(context, { id, message }) {
      const now = Date.now()
      const userId = context.state.userId
      const orderKey = `${now}-${userId}`
      urgent_queue_ref.push({
        id,
        urgent_time: now,
        added_time: now,
        add_by: userId,
        message,
        orderKey,
      })
    },
    removeFromUrgent(_context, key) {
      urgent_queue_ref.child(key).remove()
    },
    removeFromNormal(_context, key) {
      normal_queue_ref.child(key).remove()
    },

    urgent2normal(context, key) {
      console.log(key)
      const queue = { ...context.state.urgent_queue[key] }
      queue.urgent_time = false
      const orderKey = queue.orderKey

      const parameter = {}
      parameter[orderKey] = queue

      normal_queue_ref.update(parameter)
      context.dispatch('removeFromUrgent', key)
    },

    normal2urgent(context, { key, message }) {
      const queue = { ...context.state.normal_queue[key] }
      queue.urgent_time = Date.now()
      queue.message = message

      urgent_queue_ref.push(queue)
      context.dispatch('removeFromNormal', key)
    },

    editMessageAtUrgent(_context, { key, message }) {
      urgent_queue_ref.child(key).update({ message })
    },
    editMessageAtNormal(_context, { key, message }) {
      normal_queue_ref.child(key).update({ message })
    },
    removeFirst(context) {
      const target_ref = context.state.urgentQueueArray ? urgent_queue_ref : normal_queue_ref
      const queueArray = context.state.urgentQueueArray ? context.state.urgentQueueArray : context.state.normal_queue
      target_ref.child(queueArray[0].key).remove()
    },
  },
})

export default store
