import { createStore, createLogger } from 'vuex'
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

function bindListener(target, storeTarget) {
  target.once('value', snapshot => {
    getDataHandler(snapshot, storeTarget)
  })
  target.on('child_removed', oldChildSnapshot => {
    store.commit('deleteQueueTrack', { storeTarget, oldChildSnapshot })
  })
  target.on('child_added', childSnapshot => {
    const trackId = childSnapshot.val().id
    spotifyAPI.getTrack(trackId).then(addedTrack => {
      store.commit('addQueueTrack', { storeTarget, childSnapshot, addedTrack })
    })
  })
  target.on('child_changed', childSnapshot => {
    store.commit('editQueue', { storeTarget, childSnapshot })
  })
}

const normal_queue_ref = firebase.database().ref('normal_queue')
const urgent_queue_ref = firebase.database().ref('urgent_queue')

bindListener(normal_queue_ref, 'normal')
bindListener(urgent_queue_ref, 'urgent')

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
    getNormal(state) {
      return state.normal_track
    },
    getUrgent(state) {
      return state.urgent_track
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
      const key = oldChildSnapshot.key
      const queue = `${storeTarget}_queue`
      const track = `${storeTarget}_track`
      delete state[queue][key]
      delete state[track][key]
    },
    addQueueTrack(state, { storeTarget, childSnapshot, addedTrack }) {
      const key = childSnapshot.key
      const queue = `${storeTarget}_queue`
      const track = `${storeTarget}_track`
      state[queue][key] = childSnapshot.val()
      state[track][key] = addedTrack
    },
    editQueue(state, { storeTarget, childSnapshot }) {
      const key = childSnapshot.key
      const queue = `${storeTarget}_queue`
      state[queue][key] = childSnapshot.val()
    },
  },
  actions: {
    add({ rootState }, { id, message }) {
      const now = Date.now()
      const parameter = {}
      const userId = rootState.Personal.userId
      const orderKey = `${now}-${userId}`
      parameter[orderKey] = {
        id,
        added_time: now,
        added_by: userId,
        message,
        orderKey,
      }
      normal_queue_ref.update(parameter)
    },
    jumpIn({ rootState }, { id, message }) {
      const now = Date.now()
      const userId = rootState.Personal.userId
      const orderKey = `${now}-${userId}`
      urgent_queue_ref.push({
        id,
        added_time: now,
        added_by: userId,
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
      const queue = { ...context.state.urgent_queue[key] }
      const orderKey = queue.orderKey

      const parameter = {}
      parameter[orderKey] = queue

      normal_queue_ref.update(parameter)
      context.dispatch('removeFromUrgent', key)
    },

    normal2urgent(context, { key, message }) {
      const queue = { ...context.state.normal_queue[key] }
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
    // removeFirst({ state }) {
    //   const target_ref = state.urgentQueueArray ? urgent_queue_ref : normal_queue_ref
    //   const queueArray = state.urgentQueueArray ? state.urgentQueueArray : state.normal_queue
    //   target_ref.child(queueArray[0].key).remove()
    // },
  },
}

const PlayingState = {
  state: {
    volume: 0.3,
    minVolume: 0.2,
    trackInfo: {
      artists: {},
      album: {
        images: [{ url: '' }],
        external_urls: { spotify: '' },
      },
    },
    added_by: 'somebody',
    id: '1111111111',
    message: 'test test test string',
    dislike: 0,
  },
  mutations: {
    turnUp(state) {
      if (state.volume + 0.02 <= 1) state.volume += 0.02
    },
    turnDown(state) {
      if (state.volume - 0.02 >= state.minVolume) state.volume -= 0.02
    },
    refresh(state, { newTrackInfo, added_by, message, id }) {
      state.trackInfo = newTrackInfo
      state.added_by = added_by
      state.message = message
      state.dislike = 0
      state.id = id
    },
    reduceDislike(state) {
      if (state.dislike - 1 >= 0) state.dislike -= 1
    },
  },
  actions: {
    increaseDislike({ state }) {
      state.dislike += 1
      // do something
    },
  },
}

const Personal = {
  state: {
    userId: 'zhangLo',
    token: null,
  },
  mutations: {
    setToken(state, newToken) {
      state.token = newToken
    },
  },
}

const store = createStore({
  modules: {
    Queue,
    Personal,
    PlayingState,
  },
  // https://next.vuex.vuejs.org/guide/plugins.html#built-in-logger-plugin
  plugins: [createLogger()],
})

export default store
