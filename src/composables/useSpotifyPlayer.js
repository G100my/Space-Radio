import { ref, computed, watch, unref } from 'vue'
import store from '../store'
import { refreshAccessToken } from '../utility/PKCE.js'
import { messageOutputMaker } from '../utility/messageOutputMaker.js'
import { TTS } from '../utility/tts.js'
import { spotifyAPI } from '../utility/spotifyAPI'
import { useVolumeControl } from './usePlayerVolumeControl'
import {
  diffirentPlayingTrackIdHandler,
  clearPendingQueueHandler,
  setNextQueueTimeoutHandler,
  updateProgressTimeHandler,
} from './spotifyPlayerStateHandler'

let spotifyPlayer
const thisSpotifyPlayerId = ref(null)
const isThisSpotifyPlayerPaused = ref(true)
const isThisSpotifyPlayerActived = ref(false)
const isThisSpotifyPlayerReady = ref(false)

const currentActiveDeviceId = ref(null)
const currentActiveDeviceName = ref(null)

const pendingQueue = computed(() => store.getters.pendingQueue)

let resumePlayerVolume, reducePlayerVolume, updatePlayerVolume

function refreshCurrentDevice() {
  spotifyAPI.getMyCurrentPlaybackState().then(result => {
    console.log('CurrentPlaybackState: ', result)
    // 如果沒有任何裝置會是 null
    if (!result) {
      isThisSpotifyPlayerActived.value = false
      isThisSpotifyPlayerPaused.value = true
      return
    }
    const { device } = result
    currentActiveDeviceId.value = device.id
    currentActiveDeviceName.value = device.name
    isThisSpotifyPlayerActived.value = currentActiveDeviceId.value === thisSpotifyPlayerId.value
  })
}

const currentVolume = computed(() => store.getters.currentVolume)
const isTokenValid = computed(() => store.getters.isTokenValid)
const token = computed(() => store.getters.token)

function spotifyWebPlaybackSDKReadyHandler() {
  spotifyPlayer = new window.Spotify.Player({
    name: 'Jukebox player',
    volume: currentVolume.value / 100,
    getOAuthToken: callback => {
      if (isTokenValid.value) {
        callback(token.value)
      } else {
        refreshAccessToken().then(() => {
          callback(token.value)
        })
      }
    },
  })

  const eventArray = ['initialization_error', 'account_error', 'playback_error', 'authentication_error', 'not_ready']
  eventArray.forEach(event => {
    spotifyPlayer.addListener(event, message => {
      console.log(event, message)
    })
  })

  // Ready
  spotifyPlayer.addListener('ready', ({ device_id }) => {
    console.log('Ready with Device ID', device_id)
    thisSpotifyPlayerId.value = device_id
    isThisSpotifyPlayerReady.value = true

    const playerSetVolumeCallback = volume => spotifyPlayer.setVolume(volume)
    ;({ reducePlayerVolume, updatePlayerVolume, resumePlayerVolume } = useVolumeControl(playerSetVolumeCallback))
  })

  // Playback status updates
  spotifyPlayer.addListener('player_state_changed', playerState => {
    // 當不是這個裝置撥放時，斷開連結
    if (playerState === null) {
      isThisSpotifyPlayerActived.value = false
      isThisSpotifyPlayerPaused.value = true
      store.dispatch('clearPlayingTrack')
      window.onbeforeunload = null
      return
    }

    isThisSpotifyPlayerPaused.value = playerState.paused
    if (!isThisSpotifyPlayerActived.value) refreshCurrentDevice()

    diffirentPlayingTrackIdHandler(playerState.track_window.current_track)
    clearPendingQueueHandler(playerState, pendingQueue.value)
    setNextQueueTimeoutHandler(playerState)
    updateProgressTimeHandler(playerState)
  })

  spotifyPlayer.connect().then(success => {
    window.onbeforeunload = () => {
      store.dispatch('clearPlayingTrack')
      store.dispatch('clearPendingQueue')
      if (isThisSpotifyPlayerActived.value) spotifyPlayer.disconnect()
    }
    if (success) console.log('Jukebox player successfully connected to Spotify!')
    if (success && import.meta.env.DEV) window.spotifyPlayer = spotifyPlayer
  })
}

window.onSpotifyWebPlaybackSDKReady = spotifyWebPlaybackSDKReadyHandler

if (import.meta.env.MODE !== 'test') {
  import('https://sdk.scdn.co/spotify-player.js')
}

watch(isThisSpotifyPlayerActived, isActived => {
  let unwatchPendingQueue
  let unwatchVolume
  if (isActived) {
    // watch pendingQueue
    unwatchPendingQueue = watch(pendingQueue, nextQueue => {
      if (nextQueue && nextQueue.note) {
        const note = nextQueue.note
        let messageOutput4TTS = messageOutputMaker(note, nextQueue.track_name)
        messageOutput4TTS = messageOutput4TTS.replace(/[^\w^\s^\u4e00-\u9fa5]/gi, '')
        store.dispatch('updateTheLatestQueue', nextQueue)

        reducePlayerVolume()
          .then(() => {
            TTS(messageOutput4TTS)
          })
          .catch(error => {
            console.error(error)
          })
      }
    })
    // 也必須等 player 準備完成才 watch playerVolume
    unwatchVolume = watch(currentVolume, updatePlayerVolume)
  } else {
    if (unwatchPendingQueue) {
      unwatchPendingQueue()
      unwatchVolume()
      unwatchPendingQueue = null
      unwatchVolume = null
    }
  }
})

const NEXT_REDUCE_PROCESS_TIME = 3000
const NEXT_RESUME_PROCESS_TIME = 2000
function nextTrack() {
  reducePlayerVolume(NEXT_REDUCE_PROCESS_TIME)
    .then(() => store.dispatch('sendNextQueue'))
    // 神秘的 reason 參數，並沒有出現在文件，
    // 但是不給會有 error: parameter 'reason' is required
    .then(() => spotifyPlayer.nextTrack('just wanna listen next one'))
    .then(() => {
      console.log('Skipped to next track!')
      return resumePlayerVolume(NEXT_RESUME_PROCESS_TIME)
    })
    .catch(error => {
      console.error(error)
    })
}

function togglePlay() {
  const device_id = unref(thisSpotifyPlayerId)
  spotifyPlayer.getCurrentState().then(state => {
    if (!state) {
      console.warn('User is not playing music through the Web Playback SDK')
      spotifyAPI
        .transferMyPlayback([device_id])
        .then(() => {
          return spotifyAPI.getMyCurrentPlaybackState()
        })
        .then(async response => {
          if (!response.shuffle_state) await spotifyAPI.setShuffle(true, { device_id })
          if (!response.repeat_state) await spotifyAPI.setRepeat('context')

          if (!response.context || response.context.type !== 'playlist') {
            await spotifyAPI.play({ context_uri: `spotify:playlist:${store.getters.roomBasePlaylist}` })
          } else {
            spotifyPlayer.togglePlay()
          }
        })
        .then(() => spotifyAPI.getMyCurrentPlaybackState())
        .catch(error => {
          console.error(JSON.parse(error.responseText).error, error)
        })
    } else {
      spotifyPlayer.togglePlay()
    }
  })
}

export {
  togglePlay,
  spotifyPlayer,
  isThisSpotifyPlayerActived,
  nextTrack,
  isThisSpotifyPlayerPaused,
  thisSpotifyPlayerId,
  currentActiveDeviceId,
  currentActiveDeviceName,
  isThisSpotifyPlayerReady,
}
