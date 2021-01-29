import { createStore } from 'vuex'
import firebase from './firebase.js'
import { spotifyAPI } from '../plugin/spotify-web-api.js'
import { getImplicitGrantToken } from '../utility/Oauth.js'

// 用不一樣的命名方式做區隔
const normal_queue_ref = firebase.database().ref('normal_queue')
normal_queue_ref.on('value', normal_queue => {
  store.commit('updateNormalQueue', normal_queue.val())

  const trackIdArray = Object.values(normal_queue.val()).map(item => item.id)

  if (spotifyAPI.getAccessToken())
    spotifyAPI.getTracks(trackIdArray).then(result => {
      store.commit('updateTrackObjectArray', result.tracks)
    })
  else {
    console.log('spotifyAPI AccessToken is null')
    getImplicitGrantToken()
  }
})

const urgent_queue_ref = firebase.database().ref('urgent_queue')
urgent_queue_ref.on('value', urgent_queue => {
  store.commit('updateUrgentQueue', urgent_queue.val())

  const trackIdArray = Object.values(urgent_queue.val()).map(item => item.id)

  if (spotifyAPI.getAccessToken())
    spotifyAPI.getTracks(trackIdArray).then(result => {
      store.commit('updateTrackObjectArray', result.tracks)
    })
  else {
    console.log('spotifyAPI AccessToken is null')
    getImplicitGrantToken()
  }
})

//

const store = createStore({
  state: {
    userId: 'zhangLo',
    token: null,
    urgentIdQueue: null,
    urgentTrackObjectArray: null,
  },
  getters: {
    getRoomQueueURIArray(state) {
      return Object.values(state.trackIdQueue).map(item => 'spotify:track:'.concat(item))
    },
  },
  mutations: {
    setToken(state, newToken) {
      state.token = newToken
    },
    updateNormalQueue(state, newQueue) {
      state.normalQueue = newQueue
    },
    updateUrgentQueue(state, newQueue) {
      state.urgentQueue = newQueue
    },
    updateTrackObjectArray(state, newArray) {
      state.trackObjectArray = newArray
    },
    push(state, trackId) {
      normal_queue_ref.push({
        id: trackId,
        urgent_time: false,
        added_time: Date.now(),
        add_by: state.userName,
      })
    },
    jump_in(state, { trackId, message }) {
      urgent_queue_ref.push({
        id: trackId,
        urgent_time: Date.now(),
        added_time: Date.now(),
        add_by: state.userName,
        message,
      })
    },
    normal_queue_remove_first(state) {
      const key = Object.keys(state.trackIdQueue)[0]
      normal_queue_ref.child(key).remove()
    },
  },
})

export default store
