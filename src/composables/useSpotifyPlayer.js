import { ref, computed, watch } from 'vue'
import store from '../store'
import { refreshAccessToken } from '../utility/PKCE.js'
import { messageOutputMaker } from '../utility/messageOutputMaker.js'
import { TTS } from '../utility/tts.js'

let spotifyPlayer
const isSpotifyPlayerPaused = ref(true)
const spotifyPlayerId = ref(null)
const isSpotifyPlayerActived = ref(false)
let playerVolume = 50
const pendingQueue = computed(() => store.getters.pendingQueue)

// player 音量縮小比例，否則語音音量過小
const playerVolumeReduceRate = 0.7
function useWatchCurrentVolume(currentVolume) {
  watch(currentVolume, newValue => {
    playerVolume = newValue
    console.log(`currentVolume: ${currentVolume.value}, newValue: ${newValue} `)
    if (spotifyPlayer !== null) spotifyPlayer.setVolume((newValue / 100) * playerVolumeReduceRate)
  })
}

// player_state_changed handler

let positionStateCounter = 0
function clearPendingQueueHandler(playerState) {
  if (playerState.position === 0) {
    positionStateCounter++
    if (positionStateCounter >= 2) {
      positionStateCounter = 0
      // 如果已經有 pending queue 而且跟現在正在撥放的是同一首歌，清空 pending
      if (pendingQueue.value && pendingQueue.value.id === playerState.track_window.current_track.id) {
        store.dispatch('clearPendingQueue')
      }
    }
  }
}

const executeBeforeEndTime = 10000
let coundDownTimer
const leftQueueAmount = computed(() => store.getters.leftQueueAmount)
const playerPlayingTrackId = computed(() => store.getters.playerPlayingTrackId)
function diffirentPlayingTrackIdHandler(playerStateTrack) {
  // 更新 playingState, 如果 playingState 的 track id 和 player 回傳的 id 不一樣
  playerStateTrack.id !== playerPlayingTrackId.value && store.dispatch('updatePlayingTrack', playerStateTrack)
}

function setNextQueueTimeout(playerState) {
  if (!playerState.paused && leftQueueAmount.value > 0 && !pendingQueue.value) {
    // 防止開啟多個頁面且登入同樣的 host account 還都執行撥放，造成短時間內重複 dispatch sendNextQueue
    const randomTime = Math.floor(Math.random() * 5) * 5 * 1000
    const bufferTime = playerState.duration - playerState.position - executeBeforeEndTime - randomTime
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

    // 等 player 準備完成才 watch playerVolume
    useWatchCurrentVolume(currentVolume)
  })

  // 避免中途重啟 pending 會一直常駐，直到下一首歌曲取代目前的 pending
  function checkPending(playerState) {
    if (pendingQueue.value) {
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
    diffirentPlayingTrackIdHandler(playerState.track_window.current_track)
    clearPendingQueueHandler(playerState)
    setNextQueueTimeout(playerState)
    updateProgressTimeHandler(playerState)
  })
  spotifyPlayer.connect()
}
import('../utility/spotify-player-SDK.js')

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

// volume reduce/resume control

let recodeVolume
let adjustProcessTime = 5000
const adjustStepTime = 100
const adjustExecuteTimes = adjustProcessTime / adjustStepTime
const currentMinimalVolume = computed(() => store.getters.currentMinimalVolume)
function reducePlayerVolume() {
  return new Promise(success => {
    recodeVolume = playerVolume
    const step = (playerVolume - currentMinimalVolume.value) / adjustExecuteTimes
    const timer = setInterval(() => {
      const afterStep = playerVolume - step
      spotifyPlayer.setVolume(afterStep / 100)
      if (afterStep < currentMinimalVolume.value) {
        clearInterval(timer)
        success()
        return
      }
      playerVolume = afterStep
    }, adjustStepTime)
  })
}
function resumePlayerVolume() {
  return new Promise(success => {
    const step = (recodeVolume - playerVolume) / adjustExecuteTimes

    const timer = setInterval(() => {
      const afterStep = playerVolume + step
      spotifyPlayer.setVolume(afterStep / 100)
      if (afterStep > recodeVolume) {
        clearInterval(timer)
        playerVolume = recodeVolume
        recodeVolume = null
        success()
        return
      }
      playerVolume = afterStep
    }, adjustStepTime)
  })
}
function nextTrack(minimalVolume) {
  const minimalVolumeBackup = minimalVolume
  const adjustProcessTimeBackup = adjustProcessTime
  minimalVolume = 0
  adjustProcessTime = 3000

  let counter = 0
  const secondPositionStateHandler = ({ position }) => {
    if (position === 0) counter++
    // 觀察 state 行為，第二次 position == 0 的 state 發生後才會撥放
    if (counter >= 2) {
      spotifyPlayer.removeListener('player_state_changed', secondPositionStateHandler)
      resumePlayerVolume()
        .then(() => {
          minimalVolume = minimalVolumeBackup
          adjustProcessTime = adjustProcessTimeBackup
        })
        .catch(error => console.error(error))
    }
  }

  reducePlayerVolume().then(() => {
    store.dispatch('sendNextQueue', () => {
      // 神秘的 reason 參數，並沒有出現在文件，
      // 但是不給會有 error: parameter 'reason' is required
      spotifyPlayer
        .nextTrack('just wanna listen next one')
        .then(() => {
          console.log('Skipped to next track!')
          spotifyPlayer.addListener('player_state_changed', secondPositionStateHandler)
        })
        .catch(error => console.error(error))
    })
  })
}

export {
  spotifyPlayer,
  isSpotifyPlayerActived,
  resumePlayerVolume,
  reducePlayerVolume,
  nextTrack,
  isSpotifyPlayerPaused,
  spotifyPlayerId,
}
