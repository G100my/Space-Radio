import firebase from './firebase.js'

let playing_state_ref

function setPlayingStateRef(roomKey) {
  playing_state_ref = firebase.database().ref(`${roomKey}/playing_state`)
}

//

const initialQueue = {
  id: '',
  order_name: '',
  oerder_id: '',
  note: false,
  track_name: '',
  order_key: '',
}
const LatestQueue = {
  state: {
    latest_queue: { ...initialQueue },
  },
  getters: {
    latestQueue(state) {
      return state.latest_queue
    },
  },
  mutations: {
    _refreshTheLatestQueue(state, newLatestQueue) {
      if (newLatestQueue === null) state.latest_queue = { ...initialQueue }
      else state.latest_queue = newLatestQueue
    },
  },
  actions: {
    updateTheLatestQueue(_context, newQueue) {
      playing_state_ref.child('latest_queue').set(newQueue)
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
    _adjustVolume(state, value) {
      state.volume = value
    },
    _adjustMinimalVolume(state, value) {
      state.minimal_volume = value
    },
    updateMinimalVolume(_context, value) {
      playing_state_ref.child('minimal_volume').set(value)
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
  },
  mutations: {
    _adjustDislike(state, value) {
      state.dislike = value
    },
    _adjustDislikeThreshold(state, value) {
      state.dislike_threshold = value
    },
    _adjustDislikeCountdown(state, value) {
      state.dislike_countdown = value
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
        const parameter = {}
        parameter[getters.userId] = true
        playing_state_ref.child('voted_users').update(parameter)
      }
    },
    clearDislikeVote() {
      playing_state_ref.child('dislike').set(0)
      playing_state_ref.child('voted_users').set(null)
    },
    adjustIsVoted({ state, getters }, snapshot) {
      if (getters.userId) state.isVoted = snapshot.hasChild(getters.userId)
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
    currentProgress(state) {
      return state.playing_progress
    },
  },
  mutations: {
    _refreshProgress(state, newProgress) {
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
      url: 'https://github.com/G100my/Jukebox',
    },
  ],
  album: {
    url: '',
    name: '---',
    image_url: '',
  },
  is_playable: true,
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
  },
  mutations: {
    refreshPlayerTrack(state, newPlayingTrack) {
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
      }
      playing_state_ref.child('playing_track').set(track)
    },
    clearPlayingTrack() {
      playing_state_ref.update({
        playing_track: initialTrack,
        latest_queue: initialQueue,
        playing_progress: initProgress,
      })
    },
  },
}

//

function playingStateConnect2firebase(store) {
  playing_state_ref.child('volume').on('value', snapshot => {
    store.commit('_adjustVolume', snapshot.val())
  })
  playing_state_ref.child('playing_track').on('value', snapshot => {
    store.commit('refreshPlayerTrack', snapshot.val())
  })
  playing_state_ref.child('latest_queue').on('value', snapshot => {
    store.commit('_refreshTheLatestQueue', snapshot.val())
  })
  playing_state_ref.child('playing_progress').on('value', snapshot => {
    store.commit('_refreshProgress', snapshot.val())
  })
  playing_state_ref.child('dislike').on('value', snapshot => {
    store.commit('_adjustDislike', snapshot.val())
  })
  playing_state_ref.child('voted_users').on('value', snapshot => {
    store.dispatch('adjustIsVoted', snapshot)
  })
  playing_state_ref.child('minimal_volume').on('value', snapshot => {
    store.commit('_adjustMinimalVolume', snapshot.val())
  })
  playing_state_ref.child('dislike_threshold').on('value', snapshot => {
    store.commit('_adjustDislikeThreshold', snapshot.val())
  })
  playing_state_ref.child('dislike_countdown').on('value', snapshot => {
    store.commit('_adjustDislikeCountdown', snapshot.val())
  })
}

export { LatestQueue, Volume, Vote, Progress, PlayingState, playingStateConnect2firebase, setPlayingStateRef }
