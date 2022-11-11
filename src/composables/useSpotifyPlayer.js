import { ref, computed, unref, watch } from 'vue'
import store from '@/store'
import { refreshAccessToken } from '@/utility/PKCE'
import { spotifyAPI } from '@/utility/spotifyAPI'
import { useVolumeControl } from './usePlayerVolumeControl'
import {
  diffirentPlayingTrackIdHandler,
  clearPendingQueueHandler,
  setNextQueueTimeoutHandler,
  updateProgressTimeHandler,
} from './spotifyPlayerStateHandler'
import { TTSbyNote, TTS, useTTSonPlayer } from './useTTSwatch'
import { useVoteWatch } from '@/composables/useVoteWatchControl'

let spotifyPlayer
const thisSpotifyPlayerId = ref(null)
const isThisSpotifyPlayerPaused = ref(true)
const isThisSpotifyPlayerActived = ref(false)
const isThisSpotifyPlayerReady = ref(false)

const currentActiveDeviceId = ref(null)
const currentActiveDeviceName = ref(null)
const currentVolume = computed(() => store.getters.currentVolume)

const isTokenValid = computed(() => store.getters.isTokenValid)
const token = computed(() => store.getters.token)
const initSpotifySetting = {
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
}

let resumePlayerVolume, reducePlayerVolume, updatePlayerVolume

// ! fixme 有點多餘
function refreshCurrentDevice() {
  spotifyAPI.getMyCurrentPlaybackState().then(result => {
    console.log('CurrentPlaybackState: ', result)
    // 如果沒有任何裝置會是 null
    if (!result) {
      isThisSpotifyPlayerActived.value = false
      isThisSpotifyPlayerPaused.value = true
      console.log('if')
    } else {
      console.log('else')
      const { device } = result
      currentActiveDeviceId.value = device.id
      currentActiveDeviceName.value = device.name
      isThisSpotifyPlayerActived.value = currentActiveDeviceId.value === thisSpotifyPlayerId.value
    }
  })
}

function spotifyPlayerReadyHandler(device_id, isHost) {
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
      if (isHost) stopAutoCut = useVoteWatch(nextTrack)
    } else {
      if (stopAutoTTS) {
        stopAutoTTS()
        stopAutoTTS = null
      }
      if (isHost && stopAutoCut) {
        stopAutoCut()
        stopAutoCut = null
      }
    }
  })
}

//

const pendingOrder = computed(() => store.getters.pendingOrder)
const playerPlayingTrackId = computed(() => store.getters.playerPlayingTrackId)

function hostPlayerStatusChangedHandler(playerState) {
  if (playerState === null) {
    refreshCurrentDevice()
    store.dispatch('clearPlayingTrack')
    window.onbeforeunload = null
    isThisSpotifyPlayerPaused.value = true
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

function hostSDKReadyHandler() {
  spotifyPlayer = new window.Spotify.Player(initSpotifySetting)

  const eventArray = ['initialization_error', 'account_error', 'playback_error', 'authentication_error', 'not_ready']
  eventArray.forEach(event => {
    spotifyPlayer.addListener(event, message => {
      console.log(event, message)
    })
  })

  spotifyPlayer.addListener('ready', ({ device_id }) => {
    spotifyPlayerReadyHandler(device_id, true)
  })
  spotifyPlayer.addListener('player_state_changed', hostPlayerStatusChangedHandler)

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
      // return spotifyPlayer.nextTrack('just wanna listen next one')
      return spotifyAPI.skipToNext()
    })
    .then(() => resumePlayerVolume(NEXT_RESUME_PROCESS_TIME))
    .catch(error => {
      console.error(error)
    })
}

function hostTogglePlay() {
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

//

let unwatchContextUri = null
function customerTogglePlay() {
  spotifyPlayer.getCurrentState().then(state => {
    if (!state || state.paused) {
      const context_uri = computed(() => store.getters.playerPlayingTrackUri)
      customerPlay(context_uri.value).then(() => {
        spotifyPlayer.getVolume().then(r => {
          customerPlayerVolume.value = Math.floor(r * 100)
        })
      })
      unwatchContextUri = watch(context_uri, newValue => {
        customerPlay(newValue)
      })
    } else {
      isThisSpotifyPlayerPaused.value = true
      spotifyPlayer.pause()
      if (unwatchContextUri) unwatchContextUri()
    }
  })
}
async function customerPlay(context_uri) {
  const device_id = unref(thisSpotifyPlayerId)
  const position_ms = store.getters.playingProgress.position
  await spotifyAPI.play({ uris: [context_uri], device_id, position_ms }).then(() => {
    refreshCurrentDevice()
  })
}

const customerPlayerVolume = ref(0)
let unwatchCustomerPlayerMode = null
const customerPlayerMode = computed(() => store.getters.customerPlayerMode)
function customerSDKReadyHandler() {
  spotifyPlayer = new window.Spotify.Player(initSpotifySetting)

  const eventArray = ['initialization_error', 'account_error', 'playback_error', 'authentication_error', 'not_ready']
  eventArray.forEach(event => {
    spotifyPlayer.addListener(event, message => {
      console.log(event, message)
    })
  })

  spotifyPlayer.addListener('ready', ({ device_id }) => {
    spotifyPlayerReadyHandler(device_id, false)
    unwatchCustomerPlayerMode = watch(customerPlayerMode, newValue => {
      if (newValue === false) {
        spotifyPlayer.disconnect()
        unwatchCustomerPlayerMode()
        unwatchCustomerPlayerMode = null
      }
    })
    window.onbeforeunload = () => {
      if (isThisSpotifyPlayerActived.value) spotifyPlayer.disconnect()
    }
    spotifyAPI.transferMyPlayback([device_id]).then(() => {
      currentActiveDeviceId.value = device_id
    })
    spotifyPlayer.getVolume().then(result => {
      customerPlayerVolume.value = Math.floor(result * 100)
    })
    window.player = spotifyPlayer
  })
  spotifyPlayer.addListener('player_state_changed', playerState => {
    if (playerState === null) {
      refreshCurrentDevice()
      window.onbeforeunload = null
      isThisSpotifyPlayerPaused.value = true
      return
    }

    isThisSpotifyPlayerActived.value = true
    isThisSpotifyPlayerPaused.value = playerState.paused
  })

  spotifyPlayer.connect()
}

//

let hasCreated = false
function useHostSpotifyPlayer() {
  if (import.meta.env.MODE === 'test') return
  if (!hasCreated) {
    hasCreated = true
    window.onSpotifyWebPlaybackSDKReady = hostSDKReadyHandler
    import('https://sdk.scdn.co/spotify-player.js')
  }
  return {
    togglePlay: hostTogglePlay,
    spotifyPlayer,
    nextTrack,
    thisSpotifyPlayerId,
    reducePlayerVolume,
    updatePlayerVolume,
    resumePlayerVolume,
  }
}

function useCustomerSpotifyPlayer() {
  if (import.meta.env.MODE === 'test') return
  if (!hasCreated) {
    console.log('you are using customer player.')
    hasCreated = true
    window.onSpotifyWebPlaybackSDKReady = customerSDKReadyHandler
    import('https://sdk.scdn.co/spotify-player.js')
  }
  return {
    togglePlay: customerTogglePlay,
    currentActiveDeviceId,
    customerPlayerVolume,
  }
}

export {
  useHostSpotifyPlayer,
  useCustomerSpotifyPlayer,
  isThisSpotifyPlayerActived,
  isThisSpotifyPlayerPaused,
  isThisSpotifyPlayerReady,
  currentActiveDeviceId,
  currentActiveDeviceName,
}
