import { ref, computed, watch } from 'vue'
import { spotifyAPI as $spotifyAPI } from '../plugin/spotify-web-api.js'
import { refreshAccessToken } from '../utility/PKCE.js'
import store from '../store'

let player
const pendingQueue = computed(() => store.getters.pendingQueue)
const currentVolume = computed(() => store.getters.currentVolume)
const isTokenValid = computed(() => store.getters.isTokenValid)
const leftQueueAmount = computed(() => store.getters.leftQueueAmount)
const token = computed(() => store.getters.token)
const playerPlayingTrackId = computed(() => store.getters.playerPlayingTrackId)

const paused = ref(true)

let positionStateCounter = 0
const executeBeforeEndTime = 10000
let coundDownTimer
let deviceId
let deviceActived = false
let playerVolume = 50
let recodeVolume
const currentMinimalVolume = computed(() => store.getters.currentMinimalVolume)
const adjustExecuteTimes = computed(() => adjustProcessTime / adjustStepTime)
let adjustProcessTime = 5000
let adjustStepTime = 100

function togglePlay() {
  player.togglePlay(deviceId).then(() => console.log('toggle play'))
}
function reducePlayerVolume() {
  return new Promise(success => {
    recodeVolume = playerVolume

    const step = (playerVolume - currentMinimalVolume.value) / adjustExecuteTimes.value

    const timer = setInterval(() => {
      const afterStep = playerVolume - step
      player.setVolume(afterStep / 100)
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
    const step = (recodeVolume - playerVolume) / adjustExecuteTimes.value

    const timer = setInterval(() => {
      const afterStep = playerVolume + step
      player.setVolume(afterStep / 100)
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
      player.removeListener('player_state_changed', secondPositionStateHandler)
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
      player
        .nextTrack('just wanna listen next one')
        .then(() => {
          console.log('Skipped to next track!')
          player.addListener('player_state_changed', secondPositionStateHandler)
        })
        .catch(error => console.error(error))
    })
  })
}

window.onSpotifyWebPlaybackSDKReady = () => {
  player = new window.Spotify.Player({
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
    player.addListener(event, message => {
      console.log(event, message)
    })
  })

  // Ready
  player.addListener('ready', ({ device_id }) => {
    console.log('Ready with Device ID', device_id)
    deviceId = device_id
    // 把目前 host 帳號可能在其他地方播放的音樂轉移到 player，並且直接撥放
    $spotifyAPI.transferMyPlayback([deviceId], { play: false }, error => {
      error && console.log(error.response)
      if (!error) {
        deviceActived = true
      }
    })
    // 等 player 準備完成才 watch playerVolume
    watch(currentVolume, newValue => {
      console.log('currentVolume')
      playerVolume = newValue
      console.log(player)
      if (player !== null) player.setVolume(newValue / 100)
    })
  })

  // 避免中途重啟 pending 會一直常駐，直到下一首歌曲取代目前的 pending
  const checkPending = state => {
    if (pendingQueue.value) {
      if (state.track_window.next_tracks[0].id !== pendingQueue.value.id) store.dispatch('clearPendingQueue')
    }
    player.removeListener('player_state_changed', checkPending)
  }
  player.addListener('player_state_changed', checkPending)

  // Playback status updates
  player.addListener('player_state_changed', playerState => {
    console.log(playerState)
    // 斷開連結
    if (playerState === null) {
      deviceActived = false
      paused.value = true
      store.dispatch('clearPlayingTrack')
      return
    }

    paused.value = playerState.paused

    const currentNoteId = playerState.track_window.current_track.id

    // 更新 playingState, 如果 playingState 的 track id 和 player 回傳的 id 不一樣
    if (currentNoteId !== playerPlayingTrackId.value) {
      const playingTrack = playerState.track_window.current_track
      store.dispatch('updatePlayingTrack', playingTrack)
    }

    if (playerState.position === 0) {
      positionStateCounter++
      if (positionStateCounter >= 2) {
        positionStateCounter = 0

        // 如果已經有 pending queue 而且跟現在正在撥放的是同一首歌，清空 pending
        if (pendingQueue.value && pendingQueue.value.id === currentNoteId) {
          store.dispatch('clearPendingQueue')
        }
      }
    }

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
  })

  player.connect()
}

import('../utility/spotify-player-SDK.js')

export { player, togglePlay, deviceActived, resumePlayerVolume, reducePlayerVolume, nextTrack, paused }
