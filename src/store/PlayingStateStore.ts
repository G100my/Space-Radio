import firebase from '@/plugins/firebase'
import i18n from '@/locales'
import { usePersonalStore } from './PersonalStore'
import { defineStore } from 'pinia'

let playing_state_ref: firebase.database.Reference

function setPlayingStateRef(roomKey: string) {
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
export type Order = typeof initialOrder
const useLatestOrderStore = defineStore('LatestOrderStore', {
  state: () => ({ latest_order: { ...initialOrder } }),
  actions: {
    updateTheLatestOrder(order: Order) {
      playing_state_ref.child('latest_order').set(order)
    },
  },
})

//

const volumeStep = 2
const useVolumeStore = defineStore('VolumeStore', {
  state: () => ({ volume: 30, minimal_volume: 20 }),
  actions: {
    turnUp() {
      const addResult = this.volume + volumeStep
      if (addResult <= 100) playing_state_ref.update({ volume: addResult })
    },
    turnDown() {
      const reduceResult = this.volume - volumeStep
      if (reduceResult >= this.minimal_volume) playing_state_ref.update({ volume: reduceResult })
    },
  },
})

//

const useVoteStore = defineStore('VoteStore', {
  state: () => ({
    dislike: 0,
    dislike_threshold: 2,
    dislike_countdown: false,
    isVoted: false,
  }),
  actions: {
    reduceDislike() {
      const userId = usePersonalStore().user_id
      const reduceResult = this.dislike - 1
      if (reduceResult >= 0) {
        playing_state_ref.update({ dislike: reduceResult })
        playing_state_ref.child(`voted_users/${userId}`).remove()
      }
    },
    increaseDislike() {
      const userId = usePersonalStore().user_id
      const reduceResult = this.dislike + 1
      if (reduceResult <= this.dislike_threshold) {
        playing_state_ref.update({ dislike: reduceResult })
        if (!userId) throw new Error('userId is not exist.')
        const parameter = { [userId]: true }
        playing_state_ref.child('voted_users').update(parameter)
      }
    },
    clearDislikeVote() {
      playing_state_ref.child('dislike').set(0)
      playing_state_ref.child('voted_users').set(null)
    },
    adjustIsVoted(snapshot: firebase.database.DataSnapshot) {
      const userId = usePersonalStore().user_id
      if (userId) this.isVoted = snapshot.hasChild(userId)
    },
    updateDislikeThreshold(value: number) {
      playing_state_ref.child('dislike_threshold').set(value)
    },
    updateDislikeCountdown(value: number) {
      playing_state_ref.child('dislike_countdown').set(value)
    },
  },
})

//

const initProgress = {
  paused: false,
  duration: 0,
  position: 0,
}
const useProgressStore = defineStore('ProgressStore', {
  state: () => ({ playing_progress: { ...initProgress } }),
  actions: {
    updateProgress(value: number) {
      playing_state_ref.child('playing_progress').set(value)
    },
    updatePauseProgress() {
      playing_state_ref.child('playing_progress').update({ paused: true })
    },
  },
})

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
function transformURI2URL(uri: unknown) {
  if (typeof uri !== 'string') return ''
  const type = uri.split(':')[1]
  return uri.replace(`spotify:${type}:`, `https://open.spotify.com/${type}/`)
}
const usePlayingStore = defineStore('PlayingTrackStore', {
  state: () => ({
    playing_track: { ...initialTrack },
  }),
  getters: {
    playerPlayingTrackName: state =>
      state.playing_track.name ? state.playing_track.name : i18n.global.t('no_playing_track'),
  },
  actions: {
    updatePlayingTrack(newPlayingTrack: Spotify.Track) {
      const { name, id, uri: context_uri } = newPlayingTrack
      const track = {
        name,
        id,
        artists: newPlayingTrack.artists.map(item => {
          item.url = transformURI2URL(item.uri)
          return item
        }),
        album: {
          name: newPlayingTrack.album.name,
          image_url: newPlayingTrack.album.images.find(item => Number(item.height) >= 300)?.url,
          url: transformURI2URL(newPlayingTrack.album.uri),
        },
        context_uri,
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
})

//

function playingStateConnect2firebase() {
  playing_state_ref.child('volume').on('value', snapshot => {
    useVolumeStore().volume = snapshot.val()
  })
  playing_state_ref.child('minimal_volume').on('value', snapshot => {
    useVolumeStore().minimal_volume = snapshot.val()
  })

  playing_state_ref.child('playing_track').on('value', snapshot => {
    usePlayingStore().playing_track = snapshot.val() ?? { ...initialTrack }
  })
  playing_state_ref.child('latest_order').on('value', snapshot => {
    useLatestOrderStore().latest_order = snapshot.val() ?? { ...initialOrder }
  })
  playing_state_ref.child('playing_progress').on('value', snapshot => {
    useProgressStore().playing_progress = snapshot.val()
  })

  playing_state_ref.child('dislike').on('value', snapshot => {
    useVoteStore().dislike = snapshot.val()
  })
  playing_state_ref.child('voted_users').on('value', snapshot => {
    useVoteStore().adjustIsVoted = snapshot.val()
  })
  playing_state_ref.child('dislike_threshold').on('value', snapshot => {
    useVoteStore().dislike_threshold = snapshot.val()
  })
  playing_state_ref.child('dislike_countdown').on('value', snapshot => {
    useVoteStore().dislike_countdown = snapshot.val()
  })
}

export {
  playingStateConnect2firebase,
  setPlayingStateRef,
  useLatestOrderStore,
  useVoteStore,
  useVolumeStore,
  useProgressStore,
  usePlayingStore,
}
