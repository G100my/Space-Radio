import firebase from './firebase.js'

const playing_state_ref = firebase.database().ref('playing_state')
const transformURI2URL = uri => {
  if (typeof uri !== 'string') return ''
  const type = uri.split(':')[1]
  return uri.replace(`spotify:${type}:`, `https://open.spotify.com/${type}/`)
}
const volumeStep = 2
const initialTrack = {
  id: false,
  name: 'Jukebox',
  artists: [
    {
      name: 'G100',
      url: '##',
    },
  ],
  album: {
    url: '##',
    name: 'Hakuna Matata',
    image_url: '',
  },
  is_playable: true,
}
const initialQueue = {
  added_time: '',
  added_by: 'G100',
  note: {
    sender: '',
    message: '',
    recipient: '',
  },
  order_key: null,
  id: '',
}
const PlayingState = {
  state: {
    volume: 30,
    minimal_volume: 20,
    playing_track: { ...initialTrack },
    latest_queue: { ...initialQueue },
    dislike: 0,
    dislike_threshold: 2,
    isVoted: false,
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
      return state.playing_track.name
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
    latestQueue(state) {
      return state.latest_queue
    },
  },
  mutations: {
    refreshPlayerState(state, newPlayingTrack) {
      if (newPlayingTrack === null) state.playing_track = { ...initialTrack }
      else state.playing_track = newPlayingTrack
    },
    refreshTheLatestQueue(state, newLatestQueue) {
      if (newLatestQueue === null) state.latest_queue = { ...initialQueue }
      else state.latest_queue = newLatestQueue
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
      if (reduceResult <= 2) {
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
      playing_state_ref.update({ playing_track: initialTrack, latest_queue: initialQueue })
    },
    updateMinimalVolume(_context, value) {
      playing_state_ref.child('minimal_volume').set(value)
    },
    updateDislikeThreshold(_context, value) {
      playing_state_ref.child('dislike_threshold').set(value)
    },
  },
}

function playingStateFirebasePlugin(store) {
  playing_state_ref.child('volume').on('value', snapshot => {
    store.commit('adjustVolume', snapshot.val())
  })
  playing_state_ref.child('playing_track').on('value', snapshot => {
    store.commit('refreshPlayerState', snapshot.val())
  })
  playing_state_ref.child('latest_queue').on('value', snapshot => {
    store.commit('refreshTheLatestQueue', snapshot.val())
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
}

export { PlayingState, playingStateFirebasePlugin }
