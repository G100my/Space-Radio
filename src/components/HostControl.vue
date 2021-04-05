<template>
  <div class="main-control">
    <button class="play-button" type="button" @click="togglePlay">
      <svg
        v-show="paused"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        class="bi bi-play-fill"
        viewBox="0 0 16 16"
      >
        <path
          d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"
        />
      </svg>
      <svg
        v-show="!paused"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        class="bi bi-pause-fill"
        viewBox="0 0 16 16"
      >
        <path
          d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"
        />
      </svg>
    </button>
    <button
      class="setting-button"
      type="button"
      :class="{ active: isShowMinimalControlBoard }"
      @click="isShowMinimalControlBoard = !isShowMinimalControlBoard"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-gear" viewBox="0 0 16 16">
        <path
          d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"
        />
        <path
          d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"
        />
      </svg>
    </button>
    <div v-show="isShowMinimalControlBoard" class="minimal-control">
      <p>
        <span>Minimal volume:</span>
        <input ref="minimalVolumeInput" :value="currentMinimalVolume" type="number" step="2" min="10" max="50" />
      </p>
      <p>
        <span>Dislike vote threshold:</span>
        <input ref="dislikeThresholdInput" :value="currentDislikeThreshold" type="number" min="2" max="5" />
      </p>
      <div class="buttons">
        <button type="button" @click="submitHandler">submit</button>
        <button type="button" @click="resetHandler">reset</button>
      </div>
    </div>
  </div>
</template>
<script>
import { ref, watch, computed } from 'vue'
import { useStore } from 'vuex'
import { spotifyAPI as $spotifyAPI } from '../plugin/spotify-web-api.js'
import { refreshAccessToken } from '../utility/PKCE.js'
import { messageOutputMaker } from '../utility/messageOutputMaker.js'
import { utterance, setTTSVoice } from '../composables/useUtterance.js'

export default {
  setup() {
    const store = useStore()

    let dislikeThreshold = 2
    let minimalVolume = 50
    const isShowMinimalControlBoard = ref(false)

    const playerPlayingTrackId = computed(() => store.getters.playerPlayingTrackId)
    const currentVolume = computed(() => store.getters.currentVolume)
    const currentMinimalVolume = computed(() => store.getters.currentMinimalVolume)
    const currentDislike = computed(() => store.getters.currentDislike)
    const currentDislikeThreshold = computed(() => store.getters.currentDislikeThreshold)
    const leftQueueAmount = computed(() => store.getters.leftQueueAmount)
    const token = computed(() => store.getters.token)
    const isTokenValid = computed(() => store.getters.isTokenValid)

    const dislikeThresholdInput = ref(null)
    const minimalVolumeInput = ref(null)

    let player
    let playerVolume = 50
    let positionStateCounter = 0
    let recodeVolume
    const executeBeforeEndTime = 10000
    let adjustProcessTime = 5000
    let adjustStepTime = 100
    let deviceActived = false
    let deviceId
    let coundDownTimer
    let dislikeCountdownTimer
    const paused = ref(true)
    const adjustExecuteTimes = computed(() => adjustProcessTime / adjustStepTime)

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
      const eventArray = [
        'initialization_error',
        'account_error',
        'playback_error',
        'authentication_error',
        'not_ready',
      ]
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
    window.onbeforeunload = () => {
      store.dispatch('clearPlayingTrack')
      store.dispatch('clearPendingQueue')
      if (deviceActived.value) player.disconnect()
    }

    import('../utility/spotify-player-SDK.js')

    utterance.onerror = error => {
      console.log('utterance error: ', error)
      resumePlayerVolume()
    }
    utterance.onend = () => {
      console.log('utterance end')
      resumePlayerVolume()
    }
    function TTS(text) {
      if (utterance.voice === null) setTTSVoice()
      utterance.text = text
      speechSynthesis.speak(utterance)
    }

    const pendingQueue = computed(() => store.getters.pendingQueue)

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

    watch(currentDislike, newValue => {
      if (dislikeCountdownTimer && newValue < dislikeThreshold) {
        clearTimeout(dislikeCountdownTimer)
        dislikeCountdownTimer = null
      }
      if (newValue >= dislikeThreshold) {
        let counter = 10
        dislikeCountdownTimer = setInterval(() => {
          counter -= 1
          store.dispatch('updateDislikeCountdown', counter)
          console.log(counter)
          if (counter <= 0) {
            nextTrack()
            clearInterval(dislikeCountdownTimer)
            store.dispatch('clearDislikeVote')
            store.dispatch('updateDislikeCountdown', false)
            dislikeCountdownTimer = null
          }
        }, 1000)
      }
    })

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
    function nextTrack() {
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
    function togglePlay() {
      player.togglePlay(deviceId).then(() => console.log('toggle play'))
    }
    function submitHandler() {
      const editedMinimalVolume = Number.parseInt(minimalVolumeInput.value.value)
      if (minimalVolume !== editedMinimalVolume) {
        minimalVolume = editedMinimalVolume
        store.dispatch('updateMinimalVolume', minimalVolume)
      }
      const editedDislikeThreshold = Number.parseInt(dislikeThresholdInput.value.value)
      if (dislikeThreshold !== editedDislikeThreshold) {
        dislikeThreshold = editedDislikeThreshold
        store.dispatch('updateDislikeThreshold', dislikeThreshold)
      }
    }
    function resetHandler() {
      minimalVolumeInput.value = minimalVolume
      dislikeThresholdInput.value = dislikeThreshold
    }

    return {
      deviceActived,
      player,
      togglePlay,
      paused,
      isShowMinimalControlBoard,
      currentMinimalVolume,
      currentDislikeThreshold,
      submitHandler,
      resetHandler,
      minimalVolumeInput,
      dislikeThresholdInput,
    }
  },
}
</script>
<style lang="scss">
.main-control {
  position: relative;
  display: flex;
  button {
    padding: 8px 0;
  }
  button + button {
    margin-left: 15px;
  }
  .setting-button,
  .play-button {
    font-size: 0;
    color: var(--primary-neutral);
    width: 100%;
  }
  .setting-button {
    transition: color 0.3s ease-in;
  }
  .setting-button.active {
    color: var(--secondary-highlight);
  }
  svg {
    width: 25px;
    height: 25px;
  }
}
.minimal-control {
  background-color: var(--secondary-dark);
  position: absolute;
  z-index: 100;
  width: 100%;
  box-sizing: border-box;
  bottom: calc(100% + 15px);
  padding: 10px;
  border: 1px solid var(--primary-neutral);
  border-radius: var(--border-radius);
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  p {
    display: flex;
    justify-content: space-between;
  }
  p + p {
    margin-top: 5px;
  }
  span {
    margin-left: 10px;
  }
  input {
    width: 25px;
    background-color: transparent;
    color: var(--primary-light);
    margin-left: 20px;
    margin-right: 15px;
    border: none;
    border-bottom: 1px solid var(--ignore);
    text-align: center;
  }
  .buttons {
    margin-top: 15px;
    display: flex;
    justify-content: flex-end;
    button + button {
      margin-left: 15px;
    }
  }
  @media (min-width: 768px) {
    left: 105%;
    bottom: 0;
    width: max-content;

    input {
      width: 40px;
    }
  }
}
</style>
