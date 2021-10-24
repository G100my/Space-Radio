import { Order } from '@/prototype/Order.js'
import firebase from './firebase.js'

let playing_state_ref

function setPlayingStateRef(roomKey) {
  playing_state_ref = firebase.database().ref(`${roomKey}/playing_state`)
}

//

const initialOrder = {
  id: '',
  orderer_id: '',
  orderer_name: '',
  note: false,
  track_id: '',
  track_name: '',
}
const LatestOrder = {
  state: {
    latest_order: { ...initialOrder },
  },
  getters: {
    latestOrder(state) {
      return state.latest_order
    },
  },
  mutations: {
    latestOrder(state, newLatestOrder) {
      if (newLatestOrder === null) state.latest_order = { ...initialOrder }
      else state.latest_order = newLatestOrder
    },
  },
  actions: {
    updateTheLatestOrder(_context, order) {
      if (import.meta.env.DEV && !(order instanceof Order)) console.error('data is not current')
      playing_state_ref.child('latest_order').set(order)
    },
  },
}

//
const volumeStep = 2
const Volume = {
  state: {
    volume: 30,
    minimal_volume: 20,
  },
  getters: {
    currentVolume(state) {
      return state.volume
    },
    currentMinimalVolume(state) {
      return state.minimal_volume
    },
  },
  mutations: {
    currentVolume(state, value) {
      state.volume = value
    },
    currentMinimalVolume(state, value) {
      state.minimal_volume = value
    },
  },
  actions: {
    turnUp({ state }) {
      const addResult = state.volume + volumeStep
      if (addResult <= 100) playing_state_ref.update({ volume: addResult })
    },
    turnDown({ state }) {
      const reduceResult = state.volume - volumeStep
      if (reduceResult >= state.minimal_volume) playing_state_ref.update({ volume: reduceResult })
    },
  },
}

//

const Vote = {
  state: {
    dislike: 0,
    dislike_threshold: 2,
    dislike_countdown: false,
    isVoted: false,
  },
  getters: {
    currentDislikeThreshold(state) {
      return state.dislike_threshold
    },
    currentDislike(state) {
      return state.dislike
    },
    currentDislikeCountdown(state) {
      return state.dislike_countdown
    },
    isVoted(state) {
      return state.isVoted
    },
  },
  mutations: {
    currentDislike(state, value) {
      state.dislike = value
    },
    currentDislikeThreshold(state, value) {
      state.dislike_threshold = value
    },
    currentDislikeCountdown(state, value) {
      state.dislike_countdown = value
    },
    isVoted(state, value) {
      state.isVoted = value
    },
  },
  actions: {
    reduceDislike({ state, getters }) {
      const reduceResult = state.dislike - 1
      if (reduceResult >= 0) {
        playing_state_ref.update({ dislike: reduceResult })
        playing_state_ref.child(`voted_users/${getters.userId}`).remove()
      }
    },
    increaseDislike({ state, getters }) {
      const reduceResult = state.dislike + 1
      if (reduceResult <= state.dislike_threshold) {
        playing_state_ref.update({ dislike: reduceResult })
        const parameter = { [getters.userId]: true }
        playing_state_ref.child('voted_users').update(parameter)
      }
    },
    clearDislikeVote() {
      playing_state_ref.child('dislike').set(0)
      playing_state_ref.child('voted_users').set(null)
    },
    adjustIsVoted({ getters, commit }, snapshot) {
      if (getters.userId) commit('isVoted', snapshot.hasChild(getters.userId))
    },
    updateDislikeThreshold(_context, value) {
      playing_state_ref.child('dislike_threshold').set(value)
    },
    updateDislikeCountdown(_context, value) {
      playing_state_ref.child('dislike_countdown').set(value)
    },
  },
}

//

const initProgress = {
  paused: false,
  duration: 0,
  position: 0,
}
const Progress = {
  state: {
    playing_progress: { ...initProgress },
  },
  getters: {
    playingProgress(state) {
      return state.playing_progress
    },
  },
  mutations: {
    playingProgress(state, newProgress) {
      state.playing_progress = newProgress
    },
  },
  actions: {
    updateProgress(_context, value) {
      playing_state_ref.child('playing_progress').set(value)
    },
    updatePauseProgress() {
      playing_state_ref.child('playing_progress').update({ paused: true })
    },
  },
}

//

const initialTrack = {
  id: false,
  name: '',
  artists: [
    {
      name: 'G100',
      url: 'https://github.com/G100my/Space Radio',
    },
  ],
  album: {
    url: '',
    name: '---',
    image_url: '',
  },
  is_playable: true,
  context_uri: false,
}
function transformURI2URL(uri) {
  if (typeof uri !== 'string') return ''
  const type = uri.split(':')[1]
  return uri.replace(`spotify:${type}:`, `https://open.spotify.com/${type}/`)
}
const PlayingState = {
  state: {
    playing_track: { ...initialTrack },
  },
  getters: {
    playerPlayingTrackId(state) {
      return state.playing_track.id
    },
    playerPlayingArtists(state) {
      return state.playing_track.artists
    },
    playerPlayingAlbum(state) {
      return state.playing_track.album
    },
    playerPlayingTrackName(state) {
      return state.playing_track.name ? state.playing_track.name : 'No track in player'
    },
    playerPlayingTrackUri(state) {
      return state.playing_track.context_uri
    },
  },
  mutations: {
    playerTrack(state, newPlayingTrack) {
      if (!newPlayingTrack) state.playing_track = { ...initialTrack }
      else state.playing_track = newPlayingTrack
    },
  },
  actions: {
    updatePlayingTrack(_context, newPlayingTrack) {
      const track = {
        name: newPlayingTrack.name,
        id: newPlayingTrack.id,
        artists: newPlayingTrack.artists.map(item => {
          item.url = transformURI2URL(item.uri)
          delete item.uri
          return item
        }),
        album: {
          name: newPlayingTrack.album.name,
          image_url: newPlayingTrack.album.images.find(item => item.height >= 300).url,
          url: transformURI2URL(newPlayingTrack.album.uri),
        },
        context_uri: newPlayingTrack.uri,
      }
      playing_state_ref.child('playing_track').set(track)
    },
    clearPlayingTrack() {
      playing_state_ref.update({
        playing_track: initialTrack,
        latest_order: initialOrder,
        playing_progress: initProgress,
      })
    },
  },
}

//

function playingStateConnect2firebase(store) {
  playing_state_ref.child('volume').on('value', snapshot => {
    store.commit('currentVolume', snapshot.val())
  })
  playing_state_ref.child('playing_track').on('value', snapshot => {
    store.commit('playerTrack', snapshot.val())
  })
  playing_state_ref.child('latest_order').on('value', snapshot => {
    store.commit('latestOrder', snapshot.val())
  })
  playing_state_ref.child('playing_progress').on('value', snapshot => {
    store.commit('playingProgress', snapshot.val())
  })
  playing_state_ref.child('dislike').on('value', snapshot => {
    store.commit('currentDislike', snapshot.val())
  })
  playing_state_ref.child('voted_users').on('value', snapshot => {
    store.dispatch('adjustIsVoted', snapshot)
  })
  playing_state_ref.child('minimal_volume').on('value', snapshot => {
    store.commit('currentMinimalVolume', snapshot.val())
  })
  playing_state_ref.child('dislike_threshold').on('value', snapshot => {
    store.commit('currentDislikeThreshold', snapshot.val())
  })
  playing_state_ref.child('dislike_countdown').on('value', snapshot => {
    store.commit('currentDislikeCountdown', snapshot.val())
  })
}

export { LatestOrder, Volume, Vote, Progress, PlayingState, playingStateConnect2firebase, setPlayingStateRef }
