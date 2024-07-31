import { ref, computed, unref, watch, type WatchStopHandle } from 'vue'
import { usePlayingStore, useProgressStore, useQueueStore, useRoomBasicStore } from '@/store'
import { refreshAccessToken } from 'shared'
import { spotifyAPI } from '@/plugins/spotifyAPI'
import { usePlayerVolumeControl } from '@/composables/usePlayerVolumeControl'
import {
  diffirentPlayingTrackIdHandler,
  clearPendingQueueHandler,
  setNextQueueTimeoutHandler,
  updateProgressTimeHandler,
} from './spotifyPlayerStateHandler'
import { TTSbyNote, TTS, useTTSonPlayer } from './useTTSwatch'
import { useVoteWatch } from '@/composables/useVoteWatch'
import { usePersonalStore, useVolumeStore } from '@/store'

let spotifyPlayer: Spotify.Player
const thisSpotifyPlayerId = ref<string>()
const isThisSpotifyPlayerPaused = ref(true)
const isThisSpotifyPlayerActived = ref(false)
const isThisSpotifyPlayerReady = ref(false)

const currentActiveDeviceId = ref<string | null>()
const currentActiveDeviceName = ref<string | null>(null)

const getSpotifyInitSetting = (): Spotify.PlayerInit => ({
  name: 'Space Radio player',
  volume: useVolumeStore().volume / 100,
  getOAuthToken: callback => {
    const { access_token: token, isTokenValid } = usePersonalStore()
    if (isTokenValid()) {
      callback(token)
    } else {
      refreshAccessToken({
        client_id: import.meta.env.VITE_CLIENT_ID,
        refresh_token: usePersonalStore().refresh_token!,
      }).then(() => {
        callback(token)
      })
    }
  },
})

let resumePlayerVolume: ReturnType<typeof usePlayerVolumeControl>['resumePlayerVolume']
let reducePlayerVolume: ReturnType<typeof usePlayerVolumeControl>['reducePlayerVolume']
let updatePlayerVolume: ReturnType<typeof usePlayerVolumeControl>['updatePlayerVolume']

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

function spotifyPlayerReadyHandler(device_id: string, isHost: boolean) {
  console.log('Ready with Device ID', device_id)
  thisSpotifyPlayerId.value = device_id
  isThisSpotifyPlayerReady.value = true

  const playerSetVolumeCallback = (volume: number) => spotifyPlayer.setVolume(volume)
  ;({ reducePlayerVolume, updatePlayerVolume, resumePlayerVolume } = usePlayerVolumeControl(playerSetVolumeCallback))

  //
  let stopAutoTTS: ReturnType<typeof useTTSonPlayer> | null
  let stopAutoCut: ReturnType<typeof useVoteWatch> | null
  watch(isThisSpotifyPlayerActived, isActived => {
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
const pendingOrder = computed(() => useQueueStore().pendingOrder)
const playerPlayingTrackId = computed(() => usePlayingStore().playerPlayingTrackId)

function hostPlayerStatusChangedHandler(playerState: Spotify.PlaybackState) {
  if (playerState === null) {
    refreshCurrentDevice()
    usePlayingStore().clearPlayingTrack()
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
  spotifyPlayer = new window.Spotify.Player(getSpotifyInitSetting())

  const eventArray: Spotify.ErrorTypes[] = [
    'initialization_error',
    'account_error',
    'playback_error',
    'authentication_error',
  ]
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
      usePlayingStore().clearPlayingTrack()
      useQueueStore().clearPendingQueue()
      if (isThisSpotifyPlayerActived.value) spotifyPlayer.disconnect()
    }
    if (success) console.log('Space Radio player successfully connected to Spotify!')
    // @ts-ignore
    if (success && import.meta.env.DEV) window.spotifyPlayer = spotifyPlayer
    refreshCurrentDevice()
  })
}

// ===

const NEXT_REDUCE_PROCESS_TIME = 2000
const NEXT_RESUME_PROCESS_TIME = 3000
function nextTrack() {
  reducePlayerVolume(NEXT_REDUCE_PROCESS_TIME)
    .then(() => useQueueStore().nextWithAddToPending())
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
  if (!device_id) {
    throw new Error(`!device_id: ${device_id}`)
  }
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
              await spotifyAPI.play({ context_uri: `spotify:playlist:${useRoomBasicStore().base_playlist}` })
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

let unwatchContextUri: WatchStopHandle | null = null
function customerTogglePlay() {
  spotifyPlayer.getCurrentState().then(state => {
    if (!state || state.paused) {
      const context_uri = computed(() => usePlayingStore().playerPlayingTrackUri)
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
async function customerPlay(context_uri: string) {
  const device_id = unref(thisSpotifyPlayerId)
  const position_ms = useProgressStore().playing_progress.position
  await spotifyAPI.play({ uris: [context_uri], device_id, position_ms }).then(() => {
    refreshCurrentDevice()
  })
}

const customerPlayerVolume = ref(0)
let unwatchCustomerPlayerMode: WatchStopHandle | null = null
function customerSDKReadyHandler() {
  spotifyPlayer = new window.Spotify.Player(getSpotifyInitSetting())

  const eventArray: Spotify.ErrorTypes[] = [
    'initialization_error',
    'account_error',
    'playback_error',
    'authentication_error',
  ]
  eventArray.forEach(event => {
    spotifyPlayer.addListener(event, message => {
      console.log(event, message)
    })
  })

  spotifyPlayer.addListener('ready', ({ device_id }) => {
    spotifyPlayerReadyHandler(device_id, false)
    unwatchCustomerPlayerMode = watch(
      () => usePersonalStore().customerPlayerMode,
      newValue => {
        if (newValue === false) {
          spotifyPlayer.disconnect()
          if (unwatchCustomerPlayerMode) {
            unwatchCustomerPlayerMode()
            unwatchCustomerPlayerMode = null
          }
        }
      }
    )
    window.onbeforeunload = () => {
      if (isThisSpotifyPlayerActived.value) spotifyPlayer.disconnect()
    }
    spotifyAPI.transferMyPlayback([device_id]).then(() => {
      currentActiveDeviceId.value = device_id
    })
    spotifyPlayer.getVolume().then(result => {
      customerPlayerVolume.value = Math.floor(result * 100)
    })
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
