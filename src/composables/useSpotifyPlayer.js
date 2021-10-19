import { ref, computed, unref, watch } from 'vue'
import store from '../store'
import { refreshAccessToken } from '../utility/PKCE.js'
import { spotifyAPI } from '../utility/spotifyAPI'
import { useVolumeControl } from './usePlayerVolumeControl'
import {
  diffirentPlayingTrackIdHandler,
  clearPendingQueueHandler,
  setNextQueueTimeoutHandler,
  updateProgressTimeHandler,
} from './spotifyPlayerStateHandler'
import { TTSbyNote, TTS, useTTSonPlayer } from './useTTSwatch'
import { useVoteWatch } from '@/composables/useVoteWatchControl.js'

let spotifyPlayer
const thisSpotifyPlayerId = ref(null)
const isThisSpotifyPlayerPaused = ref(true)
const isThisSpotifyPlayerActived = ref(false)
const isThisSpotifyPlayerReady = ref(false)

const currentActiveDeviceId = ref(null)
const currentActiveDeviceName = ref(null)

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

//

function spotifyPlayerReadyHandler({ device_id }) {
  console.log('Ready with Device ID', device_id)
  thisSpotifyPlayerId.value = device_id
  isThisSpotifyPlayerReady.value = true

  const playerSetVolumeCallback = volume => spotifyPlayer.setVolume(volume)
  ;({ reducePlayerVolume, updatePlayerVolume, resumePlayerVolume } = useVolumeControl(playerSetVolumeCallback))

  //
  watch(isThisSpotifyPlayerActived, isActived => {
    let stopAutoTTS
    let stopAutoCut

    if (isActived) {
      stopAutoTTS = useTTSonPlayer(reducePlayerVolume, resumePlayerVolume)
      stopAutoCut = useVoteWatch()
    } else {
      if (stopAutoTTS) {
        stopAutoTTS()
        stopAutoTTS = null
      }
      if (stopAutoCut) {
        stopAutoCut()
        stopAutoCut = null
      }
    }
  })
}

const pendingOrder = computed(() => store.getters.pendingOrder)
const playerPlayingTrackId = computed(() => store.getters.playerPlayingTrackId)

function spotifyPlayerStatusChangedHandler(playerState) {
  if (playerState === null) {
    refreshCurrentDevice()
    store.dispatch('clearPlayingTrack')
    window.onbeforeunload = null
    return
  }

  isThisSpotifyPlayerActived.value = true
  isThisSpotifyPlayerPaused.value = playerState.paused
  // if (!isThisSpotifyPlayerActived.value) refreshCurrentDevice()

  diffirentPlayingTrackIdHandler(playerState, unref(playerPlayingTrackId))
  clearPendingQueueHandler(playerState, unref(pendingOrder))
  setNextQueueTimeoutHandler(playerState)
  updateProgressTimeHandler(playerState)
}

//
const currentVolume = computed(() => store.getters.currentVolume)
const isTokenValid = computed(() => store.getters.isTokenValid)
const token = computed(() => store.getters.token)

function spotifyWebPlaybackSDKReadyHandler() {
  spotifyPlayer = new window.Spotify.Player({
    name: 'Space Radio player',
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

  spotifyPlayer.addListener('ready', spotifyPlayerReadyHandler)
  spotifyPlayer.addListener('player_state_changed', spotifyPlayerStatusChangedHandler)

  spotifyPlayer.connect().then(success => {
    window.onbeforeunload = () => {
      store.dispatch('clearPlayingTrack')
      store.dispatch('clearPendingQueue')
      if (isThisSpotifyPlayerActived.value) spotifyPlayer.disconnect()
    }
    if (success) console.log('Space Radio player successfully connected to Spotify!')
    if (success && import.meta.env.DEV) window.spotifyPlayer = spotifyPlayer
    refreshCurrentDevice()
  })
}

window.onSpotifyWebPlaybackSDKReady = spotifyWebPlaybackSDKReadyHandler

if (import.meta.env.MODE !== 'test') {
  import('https://sdk.scdn.co/spotify-player.js')
}

// ===

const NEXT_REDUCE_PROCESS_TIME = 2000
const NEXT_RESUME_PROCESS_TIME = 3000
function nextTrack() {
  reducePlayerVolume(NEXT_REDUCE_PROCESS_TIME)
    .then(() => store.dispatch('nextWithAddToPending'))
    // { currentOrderId, targetQueue, order }
    .then(results => {
      if (results.order.note) TTSbyNote(results.order)
    })
    .catch(() => {
      TTS('已經沒點播了啦')
    })
    // 神秘的 reason 參數，並沒有出現在文件，
    // 但是不給會有 error: parameter 'reason' is required
    .then(() => {
      console.log('Skipped to next track!')
      return spotifyPlayer.nextTrack('just wanna listen next one')
    })
    .then(() => resumePlayerVolume(NEXT_RESUME_PROCESS_TIME))
    .catch(error => {
      console.error(error)
    })
}

function togglePlay() {
  const device_id = unref(thisSpotifyPlayerId)
  spotifyPlayer
    .getCurrentState()
    .then(state => {
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

            if (!response.context) {
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
    .then(() => {
      refreshCurrentDevice()
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
  reducePlayerVolume as reduceSpotifyPlayerVolume,
  updatePlayerVolume as updateSpotifyPlayerVolume,
  resumePlayerVolume as resumeSpotifyPlayerVolume,
}
