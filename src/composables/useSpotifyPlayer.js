import { ref, computed, watch } from 'vue'
import store from '../store'
import { refreshAccessToken } from '../utility/PKCE.js'
import { messageOutputMaker } from '../utility/messageOutputMaker.js'
import { TTS } from '../utility/tts.js'
import { spotifyAPI } from '@/utility/spotifyAPI'
import { useVolumeControl } from './usePlayerVolumeControl'

let spotifyPlayer
const isSpotifyPlayerPaused = ref(true)
const spotifyPlayerId = ref(null)
const isSpotifyPlayerActived = ref(false)

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

const leftQueueAmount = computed(() => store.getters.leftQueueAmount)
const playerPlayingTrackId = computed(() => store.getters.playerPlayingTrackId)
function diffirentPlayingTrackIdHandler(playerStateTrack) {
  // 更新 playingState, 如果 playingState 的 track id 和 player 回傳的 id 不一樣
  if (playerStateTrack.id !== playerPlayingTrackId.value) store.dispatch('updatePlayingTrack', playerStateTrack)
}

let coundDownTimer
const EXECUTE_BEFORE_END_TIME = 10000
function setNextQueueTimeout(playerState) {
  if (!playerState.paused && leftQueueAmount.value > 0 && !pendingQueue.value) {
    // 防止開啟多個頁面且登入同樣的 host account 還都執行撥放，造成短時間內重複 dispatch sendNextQueue
    const randomTime = Math.floor(Math.random() * 5) * 5 * 1000
    const bufferTime = playerState.duration - playerState.position - EXECUTE_BEFORE_END_TIME - randomTime
    // 目前歌曲結束前幾秒(executeBeforeEndTime)插入新的歌，如果被快轉至小於 executeBeforeEndTime 的剩餘時間就不插入
    if (bufferTime > 0) {
      // 每次隨機狀態出現就刷新秒數，避免曲目被快轉
      if (coundDownTimer) clearTimeout(coundDownTimer)
      console.log('set coundDownTimer')
      coundDownTimer = setTimeout(() => {
        store.dispatch('sendNextQueue')
      }, bufferTime)
    }
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

const currentVolume = computed(() => store.getters.currentVolume)
const isTokenValid = computed(() => store.getters.isTokenValid)
const token = computed(() => store.getters.token)

window.onSpotifyWebPlaybackSDKReady = () => {
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

  function refreshCurrentDevice() {
    spotifyAPI.getMyCurrentPlaybackState().then(result => {
      if (!result) return
      currentActiveDeviceId.value = result.device.id
      currentActiveDeviceName.value = result.device.name
    })
  }

  // Ready
  spotifyPlayer.addListener('ready', ({ device_id }) => {
    console.log('Ready with Device ID', device_id)
    spotifyPlayerId.value = device_id
    // 把目前 host 帳號可能在其他地方播放的音樂轉移到 player，並且直接撥放
    // $spotifyAPI.transferMyPlayback([deviceId.value], { play: false }, error => {
    //   error && console.log(error.response)
    //   if (!error) {
    //     deviceActived.value = true
    //   }
    // })
    refreshCurrentDevice()

    const playerSetVolumeCallback = volume => spotifyPlayer.setVolume(volume)
    ;({ reducePlayerVolume, updatePlayerVolume, resumePlayerVolume } = useVolumeControl(playerSetVolumeCallback))

    // 等 player 準備完成才 watch playerVolume
    watch(currentVolume, updatePlayerVolume)
  })

  // 避免中途重啟 pending 會一直常駐，直到下一首歌曲取代目前的 pending
  function checkPending(playerState) {
    if (pendingQueue.value.length) {
      if (playerState.track_window.next_tracks[0].id !== pendingQueue.value.id) store.dispatch('clearPendingQueue')
    }
    spotifyPlayer.removeListener('player_state_changed', checkPending)
  }
  spotifyPlayer.addListener('player_state_changed', checkPending)

  // Playback status updates
  spotifyPlayer.addListener('player_state_changed', playerState => {
    console.log(playerState)
    // 當不是這個裝置撥放時，斷開連結
    if (playerState === null) {
      isSpotifyPlayerActived.value = false
      isSpotifyPlayerPaused.value = true
      store.dispatch('clearPlayingTrack')
      return
    }
    isSpotifyPlayerPaused.value = playerState.paused
    if (!isSpotifyPlayerActived.value) refreshCurrentDevice()
    diffirentPlayingTrackIdHandler(playerState.track_window.current_track)
    clearPendingQueueHandler(playerState)
    setNextQueueTimeout(playerState)
    updateProgressTimeHandler(playerState)
  })
  spotifyPlayer.connect().then(success => {
    if (success) console.log('Jukebox player successfully connected to Spotify!')
  })
}
import('https://sdk.scdn.co/spotify-player.js')

// watch pendingQueue
watch(pendingQueue, nextQueue => {
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

window.onbeforeunload = () => {
  store.dispatch('clearPlayingTrack')
  store.dispatch('clearPendingQueue')
  if (isSpotifyPlayerActived.value) spotifyPlayer.disconnect()
}

const NEXT_REDUCE_PROCESS_TIME = 3000
const NEXT_RESUME_PROCESS_TIME = 3000
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
  isSpotifyPlayerActived,
  nextTrack,
  isSpotifyPlayerPaused,
  spotifyPlayerId,
  currentActiveDeviceId,
  currentActiveDeviceName,
}
