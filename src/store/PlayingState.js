import firebase from './firebase.js'
import jukeboxLogo from '../assets/vinyl-record.png'

const playing_state_ref = firebase.database().ref('playing_state')
const transformURI2URL = uri => {
  if (typeof uri !== 'string') return ''
  const type = uri.split(':')[1]
  return uri.replace(`spotify:${type}:`, `https://open.spotify.com/${type}/`)
}
const volumeStep = 0.02
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
    imageURL: jukeboxLogo,
  },
  is_playable: true,
}
const initialQueue = {
  added_time: '',
  added_by: 'Gloomy',
  note: {
    sender: '努力的 G100',
    message: '一袋米扛幾樓',
    recipient: '遠方的~你',
  },
  // fixme 沒有用到的資訊
  orderKey: null,
  id: '',
}
const PlayingState = {
  state: {
    volume: 0.3,
    minVolume: 0.2,
    dislike: 0,
    isVoted: false,
    info: {
      track: { ...initialTrack },
      queue: { ...initialQueue },
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
    updatePlayingTrack(_context, { playingState }) {
      const track = {
        name: playingState.name,
        id: playingState.id,
        artists: playingState.artists.map(item => {
          item.url = transformURI2URL(item.uri)
          delete item.uri
          return item
        }),
        album: {
          name: playingState.album.name,
          imageURL: playingState.album.images.find(item => item.height >= 300).url,
          url: transformURI2URL(playingState.album.uri),
        },
      }
      playing_state_ref.child('info/track').set(track)
    },
    updatePlayingQueue(_context, queue) {
      playing_state_ref.child('info/queue').set(queue)
    },
    clearPlayingTrack() {
      playing_state_ref.child('info').update({ track: initialTrack, queue: initialQueue })
    },
  },
}

function playingStateFirebasePlugin(store) {
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
}

export { PlayingState, playingStateFirebasePlugin }
