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
  </div>
  <div class="minimal-control">
    <p>
      <span>Minimal volume:</span>
      <input type="number" :value="minimalVolume" step="2" min="0" max="50" @change="minimalVolumeHandler" />
    </p>
    <p>
      <span>Dislike vote threshold:</span>
      <input v-model="dislikeThreshold" type="number" min="2" max="5" />
    </p>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
// 載入歌單  調節播放
export default {
  data() {
    return {
      playerVolume: 50,
      recodeVolume: null,
      executeBeforeEndTime: 10000,
      adjustProcessTime: 5000,
      adjustStepTime: 100,
      utterance: new window.SpeechSynthesisUtterance(),
      player: null,
      deviceId: null,
      coundDownTimer: null,
      positionStateCounter: 0,
      dislikeThreshold: 2,
      dislikeCountDownTimer: null,
      deviceActived: false,
      paused: true,
      minimalVolumeDeferTimer: null,
    }
  },
  computed: {
    adjustExecuteTimes() {
      return this.adjustProcessTime / this.adjustStepTime
    },
    ...mapGetters([
      'currentVolume',
      'currentDislike',
      'currentPlayingTrackId',
      'leftQueueAmount',
      'minimalVolume',
      'pendingQueue',
      'token',
      'trackData',
    ]),
  },
  watch: {
    pendingQueue(nextQueue) {
      if (nextQueue && nextQueue.note) {
        const note = nextQueue.note
        const messageOutput = `${note.sender} 插播一首 ${this.trackData['pending'].name}} 給 ${
          note.recipient.trim() === '' ? '所有人' : note.recipient
        } ${note.message}`

        this.reducePlayerVolume().then(() => {
          this.TTS(messageOutput)
        })
      }
    },
    currentVolume(newValue) {
      this.playerVolume = newValue
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
    }
    window.onSpotifyWebPlaybackSDKReady = () => {
      this.player = new window.Spotify.Player({
        name: 'Jukebox player',
        getOAuthToken: cb => {
          cb(this.token)
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
          console.log(message)
        })
      })

      // Ready
      this.player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id)
        this.deviceId = device_id
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
        if (currentNoteId !== this.currentPlayingTrackId) {
          const playingState = playerState.track_window.current_track
          this.$store.dispatch('updatePlayingTrack', { playingState })
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

    import('../../utility/spotify-player-SDK.js')

    this.utterance.pitch = 1
    this.utterance.rate = 1
    this.utterance.volume = 1
    this.utterance.lang = 'zh-TW'
    this.utterance.onend = () => {
      console.log('utterance end')
      this.resumePlayerVolume()
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

        const step = (this.playerVolume - this.minimalVolume) / this.adjustExecuteTimes

        const timer = setInterval(() => {
          const afterStep = this.playerVolume - step
          this.player.setVolume(afterStep / 100)
          if (afterStep < this.minimalVolume) {
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
          this.resumePlayerVolume().then(() => {
            this.minimalVolume = minimalVolumeBackup
            this.adjustProcessTime = adjustProcessTimeBackup
          })
        }
      }

      this.reducePlayerVolume().then(() => {
        this.player.nextTrack().then(() => {
          console.log('Skipped to next track!')
          this.player.addListener('player_state_changed', secondPositionStateHandler)
        })
      })
    },
    activeThisDevice() {
      if (!this.$spotifyAPI.getAccessToken()) this.$spotifyAPI.setAccessToken(this.token)
      this.$spotifyAPI.transferMyPlayback([this.deviceId], { play: true }, error => {
        error && console.log(error.response)
        if (!error) {
          this.deviceActived = true
          if (!this.pendingQueue) {
            setTimeout(() => {
              this.$store.dispatch('sendNextQueue')
            }, 3000)
          }
        }
      })
    },
    togglePlay() {
      this.player.togglePlay(this.deviceId).then(() => console.log('toggle play'))
    },
    minimalVolumeHandler(event) {
      if (this.minimalVolumeDeferTimer) clearTimeout(this.minimalVolumeDeferTimer)
      this.minimalVolumeDeferTimer = setTimeout(() => {
        this.$store.dispatch('updateMinimalVolume', event.target.value)
      }, 3000)
    },
  },
}
</script>
<style lang="scss">
.main-control {
  @media (min-width: 768px) {
    display: flex;
    flex-direction: column-reverse;
  }
  .play-button {
    font-size: 0;
    color: var(--primary-neutral);
    width: 100%;
  }
  svg {
    width: 40px;
    height: 40px;
  }
}
.minimal-control {
  padding: 10px;
  border: 1px solid var(--primary-highlight);
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
  @media (min-width: 768px) {
    position: static;
    .toggler {
      display: none;
    }
    .float-board {
      display: flex;
      margin-top: 0;
      padding: 10px;
    }
    input {
      width: 40px;
    }
  }
}
</style>
