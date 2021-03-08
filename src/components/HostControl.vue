<template>
  <div class="main-control">
    <button
      class="play-button"
      type="button"
      @click="!deviceActived && activeThisDevice($event), deviceActived && togglePlay($event)"
    >
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
import { mapGetters } from 'vuex'
import { refreshAccessToken } from '../utility/PKCE.js'
// 載入歌單  調節播放
export default {
  data() {
    return {
      player: null,
      deviceId: null,
      playerVolume: 50,
      deviceActived: false,
      paused: true,

      positionStateCounter: 0,
      coundDownTimer: null,

      utterance: new window.SpeechSynthesisUtterance(),
      recodeVolume: null,
      executeBeforeEndTime: 10000,
      adjustProcessTime: 5000,
      adjustStepTime: 100,

      dislikeThreshold: 2,
      dislikeCountDownTimer: null,
      minimalVolume: 50,
      minimalVolumeDeferTimer: null,

      isShowMinimalControlBoard: false,
    }
  },
  computed: {
    adjustExecuteTimes() {
      return this.adjustProcessTime / this.adjustStepTime
    },
    ...mapGetters([
      'playerPlayingTrackId',
      'currentVolume',
      'currentMinimalVolume',
      'currentDislike',
      'currentDislikeThreshold',
      'trackData',
      'pendingQueue',
      'leftQueueAmount',
      'token',
      'isTokenValid',
    ]),
  },
  watch: {
    pendingQueue(nextQueue) {
      if (nextQueue && nextQueue.note) {
        const note = nextQueue.note
        const messageOutput = `${note.sender} 插播一首 ${this.trackData['pending'].name}} 給 ${
          note.recipient.trim() === '' ? '所有人' : note.recipient
        } ${note.message}`

        this.$store.dispatch('updateTheLatestQueue', nextQueue)

        this.reducePlayerVolume()
          .then(() => {
            this.TTS(messageOutput)
          })
          .catch(error => {
            console.error(error)
          })
      }
    },
    currentDislike(newValue) {
      if (this.dislikeCountDownTimer && newValue < this.dislikeThreshold) {
        clearTimeout(this.dislikeCountDownTimer)
        this.dislikeCountDownTimer = null
      }
      if (newValue >= this.dislikeThreshold) {
        let counter = 10
        this.dislikeCountDownTimer = setInterval(() => {
          counter -= 1
          // fixme
          console.log(counter)
          if (counter <= 0) {
            this.nextTrack()
            clearInterval(this.dislikeCountDownTimer)
            this.dislikeCountDownTimer = null
          }
        }, 1000)
      }
    },
  },
  created() {
    window.onbeforeunload = () => {
      this.$store.dispatch('clearPlayingTrack')
      this.$store.dispatch('clearPendingQueue')
    }
    window.onSpotifyWebPlaybackSDKReady = () => {
      this.player = new window.Spotify.Player({
        name: 'Jukebox player',
        volume: this.currentVolume / 100,
        getOAuthToken: callback => {
          if (this.isTokenValid) {
            callback(this.token)
          } else {
            refreshAccessToken().then(() => {
              callback(this.token)
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
        this.player.addListener(event, message => {
          console.log(event, message)
        })
      })

      // Ready
      this.player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id)
        this.deviceId = device_id
        // 等 player 準備完成才 watch playerVolume
        this.$watch('currentVolume', newValue => {
          console.log('currentVolume')
          this.playerVolume = newValue
          console.log(this.player)
          if (this.player !== null) this.player.setVolume(newValue / 100)
        })
      })

      // 避免中途重啟 pending 會一直常駐，直到下一首歌曲取代目前的 pending
      const checkPending = state => {
        if (this.pendingQueue) {
          if (state.track_window.next_tracks[0].id !== this.pendingQueue.id) this.$store.dispatch('clearPendingQueue')
        }
        this.player.removeListener('player_state_changed', checkPending)
      }
      this.player.addListener('player_state_changed', checkPending)

      // Playback status updates
      this.player.addListener('player_state_changed', playerState => {
        console.log(playerState)
        // 斷開連結
        if (playerState === null) {
          this.deviceActived = false
          this.paused = true
          this.$store.dispatch('clearPlayingTrack')
          return
        }

        this.paused = playerState.paused

        const currentNoteId = playerState.track_window.current_track.id

        // 更新 playingState, 如果 playingState 的 track id 和 player 回傳的 id 不一樣
        if (currentNoteId !== this.playerPlayingTrackId) {
          const playingTrack = playerState.track_window.current_track
          this.$store.dispatch('updatePlayingTrack', playingTrack)
        }

        if (playerState.position === 0) {
          this.positionStateCounter++
          if (this.positionStateCounter >= 2) {
            this.positionStateCounter = 0

            this.$store.dispatch('clearDislikeVote')

            // 如果已經有 pending queue 而且跟現在正在撥放的是同一首歌，清空 pending
            if (this.pendingQueue && this.pendingQueue.id === currentNoteId) {
              this.$store.dispatch('clearPendingQueue')
            }
          }
        }

        if (!playerState.paused && this.leftQueueAmount > 0) {
          const bufferTime = playerState.duration - playerState.position - this.executeBeforeEndTime
          // 目前歌曲結束前幾秒(executeBeforeEndTime)插入新的歌，如果被快轉至小於 executeBeforeEndTime 的剩餘時間就不插入
          if (bufferTime > 0) {
            // 每次隨機狀態出現就刷新秒數，避免曲目被快轉
            if (this.coundDownTimer) clearTimeout(this.coundDownTimer)
            console.log('set coundDownTimer')
            this.coundDownTimer = setTimeout(() => {
              this.$store.dispatch('sendNextQueue')
            }, bufferTime)
          }
        }
      })

      this.player.connect()
    }

    import('../utility/spotify-player-SDK.js')

    this.utterance.pitch = 1
    this.utterance.rate = 1
    this.utterance.volume = 1
    this.utterance.lang = 'zh-TW'
    this.utterance.onend = () => {
      console.log('utterance end')
      this.resumePlayerVolume().catch(error => {
        console.error(error)
      })
    }
    speechSynthesis.onvoiceschanged = () => {
      if (!this.utterance.voice) this.setTTSVoice()
    }
  },
  methods: {
    setTTSVoice() {
      const voice = speechSynthesis
        .getVoices()
        .find(item => item.name.includes('Google') && item.lang.includes('zh-TW'))
      if (voice !== null) this.utterance.voice = voice
    },
    TTS(text) {
      if (this.utterance.voice === null) this.setTTSVoice()
      this.utterance.text = text
      speechSynthesis.speak(this.utterance)
    },
    reducePlayerVolume() {
      return new Promise(success => {
        this.recodeVolume = this.playerVolume

        const step = (this.playerVolume - this.currentMinimalVolume) / this.adjustExecuteTimes

        const timer = setInterval(() => {
          const afterStep = this.playerVolume - step
          this.player.setVolume(afterStep / 100)
          if (afterStep < this.currentMinimalVolume) {
            clearInterval(timer)
            success()
            return
          }
          this.playerVolume = afterStep
        }, this.adjustStepTime)
      })
    },
    resumePlayerVolume() {
      return new Promise(success => {
        const step = (this.recodeVolume - this.playerVolume) / this.adjustExecuteTimes

        const timer = setInterval(() => {
          const afterStep = this.playerVolume + step
          this.player.setVolume(afterStep / 100)
          if (afterStep > this.recodeVolume) {
            clearInterval(timer)
            this.playerVolume = this.recodeVolume
            this.recodeVolume = null
            success()
            return
          }
          this.playerVolume = afterStep
        }, this.adjustStepTime)
      })
    },
    nextTrack() {
      const minimalVolumeBackup = this.minimalVolume
      const adjustProcessTimeBackup = this.adjustProcessTime
      this.minimalVolume = 0
      this.adjustProcessTime = 3000

      let counter = 0
      const secondPositionStateHandler = ({ position }) => {
        if (position === 0) counter++
        // 觀察 state 行為，第二次 position == 0 的 state 發生後才會撥放
        if (counter >= 2) {
          this.player.removeListener('player_state_changed', secondPositionStateHandler)
          this.resumePlayerVolume()
            .then(() => {
              this.minimalVolume = minimalVolumeBackup
              this.adjustProcessTime = adjustProcessTimeBackup
            })
            .catch(error => console.error(error))
        }
      }

      this.reducePlayerVolume().then(() => {
        // 神秘的 reason 參數，並沒有出現在文件，起初不給 string 也沒事...
        this.player
          .nextTrack('just wanna listen next one')
          .then(() => {
            console.log('Skipped to next track!')
            this.player.addListener('player_state_changed', secondPositionStateHandler)
          })
          .catch(error => console.error(error))
      })
    },
    activeThisDevice() {
      if (!this.$spotifyAPI.getAccessToken()) this.$spotifyAPI.setAccessToken(this.token)
      this.$spotifyAPI.transferMyPlayback([this.deviceId], { play: true }, error => {
        error && console.log(error.response)
        if (!error) {
          this.deviceActived = true
        }
      })
    },
    togglePlay() {
      this.player.togglePlay(this.deviceId).then(() => console.log('toggle play'))
    },
    submitHandler() {
      const editedMinimalVolume = Number.parseInt(this.$refs.minimalVolumeInput.value)
      if (this.minimalVolume !== editedMinimalVolume) {
        this.minimalVolume = editedMinimalVolume
        this.$store.dispatch('updateMinimalVolume', this.minimalVolume)
      }
      const editedDislikeThreshold = Number.parseInt(this.$refs.dislikeThresholdInput.value)
      if (this.dislikeThreshold !== editedDislikeThreshold) {
        this.dislikeThreshold = editedDislikeThreshold
        this.$store.dispatch('updateDislikeThreshold', this.dislikeThreshold)
      }
    },
    resetHandler() {
      this.$refs.minimalVolumeInput.value = this.minimalVolume
      this.$refs.dislikeThresholdInput.value = this.dislikeThreshold
    },
  },
}
</script>
<style lang="scss">
.main-control {
  position: relative;
  display: flex;
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
    width: 40px;
    height: 40px;
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
