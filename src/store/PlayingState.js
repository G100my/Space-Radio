import firebase from './firebase.js'
import jukeboxLogo from '../assets/vinyl-record.png'

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
    image_url: jukeboxLogo,
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
    minimalVolume: 20,
    dislike: 0,
    isVoted: false,
    playing_track: { ...initialTrack },
    latest_queue: { ...initialQueue },
  },
  getters: {
    currentPlayingTrackId(state) {
      return state.playing_track.id
    },
    currentPlayingArtists(state) {
      return state.playing_track.artists
    },
    currentPlayingAlbum(state) {
      return state.playing_track.album
    },
    currentPlayingTrackName(state) {
      return state.playing_track.name
    },
    currentMinimalVolume(state) {
      return state.minimalVolume
    },
    currentVolume(state) {
      return state.volume
    },
    currentDislike(state) {
      return state.dislike
    },
  },
  mutations: {
    refreshPlayingSatae(state, newPlayingTrack) {
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
      state.minimalVolume = value
    },
  },
  actions: {
    turnUp({ state }) {
      const addResult = state.volume + volumeStep
      if (addResult <= 100) playing_state_ref.update({ volume: addResult })
    },
    turnDown({ state }) {
      const reduceResult = state.volume - volumeStep
      if (reduceResult >= state.minimalVolume) playing_state_ref.update({ volume: reduceResult })
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
    clearDislikeVote() {
      playing_state_ref.child('dislike').set(0)
      playing_state_ref.child('votedUsers').set(null)
    },
    adjustIsVoted({ state, rootState }, snapshot) {
      if (rootState.Personal.userId) state.isVoted = snapshot.hasChild(rootState.Personal.userId)
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
      playing_state_ref.child('minimalValume').set(value)
    },
  },
}

function playingStateFirebasePlugin(store) {
  playing_state_ref.child('volume').on('value', snapshot => {
    store.commit('adjustVolume', snapshot.val())
  })
  playing_state_ref.child('playing_track').on('value', snapshot => {
    store.commit('refreshPlayingSatae', snapshot.val())
  })
  playing_state_ref.child('latest_queue').on('value', snapshot => {
    store.commit('refreshTheLatestQueue', snapshot.val())
  })
  playing_state_ref.child('dislike').on('value', snapshot => {
    store.commit('adjustDislike', snapshot.val())
  })
  playing_state_ref.child('votedUsers').on('value', snapshot => {
    store.dispatch('adjustIsVoted', snapshot)
  })
}

export { PlayingState, playingStateFirebasePlugin }
