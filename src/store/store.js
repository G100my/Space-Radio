import { createStore, createLogger } from 'vuex'
import firebase from './firebase.js'
import { spotifyAPI } from '../plugin/spotify-web-api.js'
import jukeboxLogo from '../assets/vinyl-record.png'

// 用 _ 區隔 firebase 變數

function bindListener(target, storeTarget) {
  target.on('child_removed', oldChildSnapshot => {
    store.commit('deleteQueueTrack', { storeTarget, oldChildSnapshot })
  })
  target.on('child_added', childSnapshot => {
    const trackId = childSnapshot.val().id
    if (spotifyAPI.getAccessToken())
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
    normalTrackInfo(state) {
      return state.normal_track
    },
    urgentTrackInfo(state) {
      return state.urgent_track
    },
    normalQueue(state) {
      return state.normal_queue
  },
    urgentQueue(state) {
      return state.urgent_queue
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
  },
}

const playing_state_ref = firebase.database().ref('playing_state')

playing_state_ref.child('volume').on('value', snapshot => {
  store.commit('adjustVolume', snapshot.val())
})
playing_state_ref.child('info').on('value', snapshot => {
  store.commit('refreshPlayingSatae', snapshot.val())
})
playing_state_ref.child('dislike').on('value', snapshot => {
  console.log('dislike', snapshot.val())
  store.commit('adjustDislike', snapshot.val())
})
playing_state_ref.child('votedUsers').on('value', snapshot => {
  console.log('votedUsers', snapshot)
  store.dispatch('adjustIsVoted', snapshot)
})

const volumeStep = 0.02
const PlayingState = {
  state: {
    volume: 0.3,
    minVolume: 0.2,
    dislike: 0,
    isVoted: false,
    info: {
      track: {
        artists: {
          0: {
            name: 'No artists data',
            external_urls: {
              spotify: '##',
            },
          },
        },
        album: {
          images: [{ url: jukeboxLogo }],
          external_urls: { spotify: '##' },
          release_date: '',
        },
        id: null,
        name: 'Hakuna Matata',
      },
      queue: {
        added_time: '',
        added_by: 'somebody',
        message: 'test test test string',
      },
    },
  },
  getters: {
    currentPlayingTrackId(state) {
      return state.info.track.id
    },
    currentPlayingArtists(state) {
      return state.info.track.artists
    },
    currentPlayingAlbum(state) {
      return state.info.track.album
    },
    currentPlayingTrackName(state) {
      return state.info.track.name
    },
  },
  mutations: {
    refreshPlayingSatae(state, infoObject) {
      state.info = infoObject
      state.dislike = 0
    },
    adjustVolume(state, value) {
      state.volume = value
    },
    adjustDislike(state, value) {
      state.dislike = value
    },
  },
  actions: {
    turnUp({ state }) {
      const addResult = state.volume + volumeStep
      if (addResult <= 1) playing_state_ref.update({ volume: addResult })
    },
    turnDown({ state }) {
      const reduceResult = state.volume - volumeStep
      if (reduceResult >= state.minVolume) playing_state_ref.update({ volume: reduceResult })
    },
    reduceDislike({ state, rootState }) {
      const reduceResult = state.dislike - 1
      if (reduceResult >= 0) {
        playing_state_ref.update({ dislike: reduceResult })
        playing_state_ref.child(`votedUsers/${rootState.Personal.userId}`).remove()
      }
    },
    increaseDislike({ state, rootState }) {
      const reduceResult = state.dislike + 1
      if (reduceResult <= 2) {
        playing_state_ref.update({ dislike: reduceResult })
        const parameter = {}
        parameter[rootState.Personal.userId] = true
        playing_state_ref.child('votedUsers').update(parameter)
      }
    },
    adjustIsVoted({ state, rootState }, snapshot) {
      state.isVoted = snapshot.hasChild(rootState.Personal.userId)
    },
  },
}

const Personal = {
  state: {
    userId: 'zhangLo',
    token: localStorage.getItem('jukebox_token') || null,
    expiredTime: Number(localStorage.getItem('jukebox_expired_time')) || null,
    playlists: null,
    image: null,
  },
  getters: {
    token(state) {
      return state.token
    },
    isTokenValid(state) {
      if (state.expiredTime === null) return false
      const now = Date.now()
      return state.expiredTime > now
    },
  },
  mutations: {
    refreshToken(state, { newToken, expiredTime }) {
      state.token = newToken
      state.expiredTime = expiredTime
      localStorage.setItem('jukebox_token', newToken)
      localStorage.setItem('jukebox_expired_time', expiredTime)
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
