import { createStore } from 'vuex'
import firebase from './firebase.js'
import { spotifyAPI } from '../plugin/spotify-web-api.js'
import { getImplicitGrantToken } from '../utility/Oauth.js'

// 用不一樣的命名方式做區隔
const room_queue_ref = firebase.database().ref('room_queue')
room_queue_ref.on('value', snapshot => {
  store.commit('updateRoomQueue', snapshot.val())

  const trackIdArray = Object.values(snapshot.val()).map(item => item.id)

  if (spotifyAPI.getAccessToken())
    spotifyAPI.getTracks(trackIdArray).then(result => {
      store.commit('updateTrackObjectArray', result.tracks)
    })
  else {
    console.log('spotifyAPI AccessToken is null')
    getImplicitGrantToken()
  }
})

const store = createStore({
  state: {
    token: null,
    trackIdQueue: null,
    trackObjectArray: null,
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
    updateRoomQueue(state, newQueue) {
      state.trackIdQueue = newQueue
    },
    updateTrackObjectArray(state, newArray) {
      state.trackObjectArray = newArray
    },
    room_queue_push(state, addedTrack) {
      room_queue_ref.push(addedTrack.id)
    },
    room_queue_remove_first(state) {
      const key = Object.keys(state.trackIdQueue)[0]
      room_queue_ref.child(key).remove()
    },
  },
})

export default store
