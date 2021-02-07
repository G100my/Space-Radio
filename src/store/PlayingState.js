import firebase from './firebase.js'
import jukeboxLogo from '../assets/vinyl-record.png'

const playing_state_ref = firebase.database().ref('playing_state')

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
