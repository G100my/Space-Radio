import { ref, computed, watch } from 'vue'
import store from '../store'
import { refreshAccessToken } from '../utility/PKCE.js'
import { messageOutputMaker } from '../utility/messageOutputMaker.js'
import { TTS } from '../utility/tts.js'
import { spotifyAPI } from '../utility/spotifyAPI'
import { useVolumeControl } from './usePlayerVolumeControl'

let spotifyPlayer
const isSpotifyPlayerPaused = ref(true)
const spotifyPlayerId = ref(null)
const isThisSpotifyPlayerActived = ref(false)

const currentActiveDeviceId = ref(null)
const currentActiveDeviceName = ref(null)

const pendingQueue = computed(() => store.getters.pendingQueue)

let resumePlayerVolume, reducePlayerVolume, updatePlayerVolume

let positionStateCounter = 0
const POSTIION_STATE_LIMIT = 2
function clearPendingQueueHandler(playerState) {
  if (playerState.position === 0) {
    positionStateCounter++
  } else if (positionStateCounter >= POSTIION_STATE_LIMIT) {
    positionStateCounter = 0
  }
  // 如果已經有 pending queue 而且跟現在正在撥放的是同一首歌，清空 pending
  if (pendingQueue.value && pendingQueue.value.id === playerState.track_window.current_track.id) {
    store.dispatch('clearPendingQueue')
  }
}

const playerPlayingTrackId = computed(() => store.getters.playerPlayingTrackId)
function diffirentPlayingTrackIdHandler(playerStateTrack) {
  // 更新 playingState, 如果 playingState 的 track id 和 player 回傳的 id 不一樣
  if (playerStateTrack.id !== playerPlayingTrackId.value) store.dispatch('updatePlayingTrack', playerStateTrack)
}

// 獲得狀態 刷新計時
// bufferTime < 10 不再更新計時
// 有沒有歌不再範圍內
// 快轉不考慮
let coundDownTimer
const EXECUTE_BEFORE_END_TIME = 10000
function setNextQueueTimeoutHandler({ duration, position, paused }) {
  if (position == 0) return
  if (paused && coundDownTimer) clearTimeout(coundDownTimer)
  const bufferTime = duration - position - EXECUTE_BEFORE_END_TIME
  if (!paused && bufferTime > 0) {
    if (coundDownTimer) clearTimeout(coundDownTimer)
    coundDownTimer = setTimeout(() => {
      store.dispatch('sendNextQueue')
    }, bufferTime)
  }
}

let lastTimestamp = 0
function updateProgressTimeHandler(playerState) {
  const { paused, duration, position, timestamp } = playerState
  if (timestamp - lastTimestamp < 1500) {
    lastTimestamp = timestamp
  } else if (position !== 0 && !paused) {
    store.dispatch('updateProgress', { paused, duration, position })
  } else if (paused) {
    store.dispatch('updatePauseProgress')
  }
}

function refreshCurrentDevice() {
  spotifyAPI.getMyCurrentPlaybackState().then(result => {
    if (!result) return
    currentActiveDeviceId.value = result.device.id
    currentActiveDeviceName.value = result.device.name
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
    spotifyPlayerId.value = device_id
    refreshCurrentDevice()

    const playerSetVolumeCallback = volume => spotifyPlayer.setVolume(volume)
    ;({ reducePlayerVolume, updatePlayerVolume, resumePlayerVolume } = useVolumeControl(playerSetVolumeCallback))
  })

  // Playback status updates
  spotifyPlayer.addListener('player_state_changed', playerState => {
    // 當不是這個裝置撥放時，斷開連結
    if (playerState === null) {
      isThisSpotifyPlayerActived.value = false
      isSpotifyPlayerPaused.value = true
      store.dispatch('clearPlayingTrack')
      window.onbeforeunload = null
      return
    }
    isSpotifyPlayerPaused.value = playerState.paused
    if (!isThisSpotifyPlayerActived.value) refreshCurrentDevice()

    diffirentPlayingTrackIdHandler(playerState.track_window.current_track)
    clearPendingQueueHandler(playerState)
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
  reducePlayerVolume(NEXT_REDUCE_PROCESS_TIME).then(() => {
    store.dispatch('sendNextQueue', () => {
      // 神秘的 reason 參數，並沒有出現在文件，
      // 但是不給會有 error: parameter 'reason' is required
      spotifyPlayer
        .nextTrack('just wanna listen next one')
        .then(() => {
          console.log('Skipped to next track!')
          resumePlayerVolume(NEXT_RESUME_PROCESS_TIME)
        })
        .catch(error => {
          console.error(error)
        })
    })
  })
}

export {
  spotifyPlayer,
  isThisSpotifyPlayerActived,
  nextTrack,
  isSpotifyPlayerPaused,
  spotifyPlayerId,
  currentActiveDeviceId,
  currentActiveDeviceName,
}
// just for test
export { setNextQueueTimeoutHandler }
