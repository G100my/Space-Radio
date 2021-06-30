import firebase from './firebase.js'

let playing_state_ref

function setPlayingStateRef(roomKey) {
  playing_state_ref = firebase.database().ref(`${roomKey}/playing_state`)
}

const transformURI2URL = uri => {
  if (typeof uri !== 'string') return ''
  const type = uri.split(':')[1]
  return uri.replace(`spotify:${type}:`, `https://open.spotify.com/${type}/`)
}
const volumeStep = 2
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
const initialQueue = {
  added_time: '',
  added_by: '',
  note: false,
  order_key: null,
  id: '',
}
const initProgress = {
  paused: false,
  duration: 0,
  position: 0,
}
const PlayingState = {
  state: {
    volume: 30,
    minimal_volume: 20,
    playing_track: { ...initialTrack },
    latest_queue: { ...initialQueue },
    dislike: 0,
    dislike_threshold: 2,
    dislike_countdown: false,
    isVoted: false,
    playing_progress: { ...initProgress },
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
    currentVolume(state) {
      return state.volume
    },
    currentMinimalVolume(state) {
      return state.minimal_volume
    },
    currentDislikeThreshold(state) {
      return state.dislike_threshold
    },
    currentDislike(state) {
      return state.dislike
    },
    currentDislikeCountdown(state) {
      return state.dislike_countdown
    },
    currentProgress(state) {
      return state.playing_progress
    },
    latestQueue(state) {
      return state.latest_queue
    },
  },
  mutations: {
    refreshPlayerTrack(state, newPlayingTrack) {
      if (!newPlayingTrack) state.playing_track = { ...initialTrack }
      else state.playing_track = newPlayingTrack
    },
    refreshTheLatestQueue(state, newLatestQueue) {
      if (newLatestQueue === null) state.latest_queue = { ...initialQueue }
      else state.latest_queue = newLatestQueue
    },
    refreshProgress(state, newProgress) {
      state.playing_progress = newProgress
    },
    adjustVolume(state, value) {
      state.volume = value
    },
    adjustDislike(state, value) {
      state.dislike = value
    },
    adjustMinimalVolume(state, value) {
      state.minimal_volume = value
    },
    adjustDislikeThreshold(state, value) {
      state.dislike_threshold = value
    },
    adjustDislikeCountdown(state, value) {
      state.dislike_countdown = value
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
    updateTheLatestQueue(_context, newQueue) {
      playing_state_ref.child('latest_queue').set(newQueue)
    },
    clearPlayingTrack() {
      playing_state_ref.update({
        playing_track: initialTrack,
        latest_queue: initialQueue,
        playing_progress: initProgress,
      })
    },
    updateMinimalVolume(_context, value) {
      playing_state_ref.child('minimal_volume').set(value)
    },
    updateDislikeThreshold(_context, value) {
      playing_state_ref.child('dislike_threshold').set(value)
    },
    updateDislikeCountdown(_context, value) {
      playing_state_ref.child('dislike_countdown').set(value)
    },
    updateProgress(_context, value) {
      playing_state_ref.child('playing_progress').set(value)
    },
    updatePauseProgress() {
      playing_state_ref.child('playing_progress').update({ paused: true })
    },
  },
}

function playingStateConnect2firebase(store) {
  playing_state_ref.child('volume').on('value', snapshot => {
    store.commit('adjustVolume', snapshot.val())
  })
  playing_state_ref.child('playing_track').on('value', snapshot => {
    store.commit('refreshPlayerTrack', snapshot.val())
  })
  playing_state_ref.child('latest_queue').on('value', snapshot => {
    store.commit('refreshTheLatestQueue', snapshot.val())
  })
  playing_state_ref.child('playing_progress').on('value', snapshot => {
    store.commit('refreshProgress', snapshot.val())
  })
  playing_state_ref.child('dislike').on('value', snapshot => {
    store.commit('adjustDislike', snapshot.val())
  })
  playing_state_ref.child('voted_users').on('value', snapshot => {
    store.dispatch('adjustIsVoted', snapshot)
  })
  playing_state_ref.child('minimal_volume').on('value', snapshot => {
    store.commit('adjustMinimalVolume', snapshot.val())
  })
  playing_state_ref.child('dislike_threshold').on('value', snapshot => {
    store.commit('adjustDislikeThreshold', snapshot.val())
  })
  playing_state_ref.child('dislike_countdown').on('value', snapshot => {
    store.commit('adjustDislikeCountdown', snapshot.val())
  })
}

export { PlayingState, playingStateConnect2firebase, setPlayingStateRef }
