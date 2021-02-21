<template>
  <div>
    <button type="button" @click="togglePlay">togglePlay</button>
    <button type="button" @click="activeThisDevice">activeThisDevice</button>
  </div>
</template>
<script>
// 載入歌單  調節播放
export default {
  data() {
    return {
      currentVolume: 1,
      recodeVolume: null,
      minimalVolume: 0.1,
      executeBeforeEndTime: 10000,
      adjustProcessTime: 5000,
      adjustStepTime: 100,
      utterance: new window.SpeechSynthesisUtterance(),
      player: null,
      deviceId: null,
      coundDownTimer: null,
      lastTimestamp: null,
    }
  },
  computed: {
    hasNote2read() {
      return Boolean(this.currentNote)
    },
    adjustExecuteTimes() {
      return this.adjustProcessTime / this.adjustStepTime
    },
    currentNote() {
      return this.$store.getters.pendingNote
    },
    messageOutput() {
      if (!this.currentNote) return '一袋米扛幾樓'

      return `${this.currentNote.sender} 插播一首 ${this.currentNote.trackName} 給 ${
        this.currentNote.recipient.trim() === '' ? '所有人' : this.currentNote.recipient
      } ${this.currentNote.message}`
    },
  },
  watch: {
    currentVolume(newValue) {
      this.player.setVolume(newValue)
      console.log(newValue)
    },
  },
  created() {
    window.onSpotifyWebPlaybackSDKReady = () => {
      this.player = new window.Spotify.Player({
        name: 'Jukebox player',
        getOAuthToken: cb => {
          cb(this.$store.getters.token)
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
        if (this.$store.getters.pendingQueue) {
          if (state.track_window.next_tracks[0].id !== this.$store.getters.pendingQueue.id)
            this.$store.dispatch('clearPendingQueue')
        }
        this.player.removeListener('player_state_changed', checkPending)
      }
      this.player.addListener('player_state_changed', checkPending)

      // Playback status updates
      this.player.addListener('player_state_changed', playerState => {
        console.log(playerState)
        // 斷開連結
        if (playerState === null) {
          this.$store.dispatch('clearPlayingTrack')
          return
        }

        const currentNoteId = playerState.track_window.current_track.id

        // 更新 playingState, 如果 playingState 的 track id 和 player 回傳的 id 不一樣
        if (currentNoteId !== this.$store.getters.currentPlayingTrackId) {
          const playingState = playerState.track_window.current_track
          this.$store.dispatch('updatePlayingTrack', { playingState })
        }

        // 避免極短時間內發出的 playerState
        if (this.lastTimestamp && this.lastTimestamp + 1500 > playerState.timestamp) return

        this.lastTimestamp = playerState.timestamp

        if (playerState.position === 0) {
          // 如果已經有 pending queue 而且跟現在正在撥放的是同一首歌，清空 pending
          if (this.$store.getters.pendingQueue && this.$store.getters.pendingQueue.id === currentNoteId) {
            this.$store.dispatch('clearPendingQueue')
          }
        }

        // 每次隨機狀態出現就刷新秒數，避免曲目被快轉
        if (this.coundDownTimer) clearTimeout(this.coundDownTimer)

        if (!playerState.paused) {
          const bufferTime = playerState.duration - playerState.position - this.executeBeforeEndTime

          // 目前歌曲結束前幾秒(executeBeforeEndTime)插入新的歌，如果被快轉至小於 executeBeforeEndTime 的剩餘時間就不插入
          if (this.$store.getters.leftQueueAmount > 0 && bufferTime > 0) {
            this.coundDownTimer = setTimeout(() => {
              console.log('準備下一首~')
              this.$store.dispatch('sendNextQueue')

              // 如果有 note 插入 TTS
              this.hasNote2read && this.reduceVolume(this.TTS)
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
    reducePlayerVolume(callback) {
      this.recodeVolume = this.currentVolume

      const step = (this.currentVolume - this.minimalVolume) / this.adjustExecuteTimes

      const timer = setInterval(() => {
        this.currentVolume -= step
        if (this.currentVolume < this.minimalVolume) {
          callback()
          clearInterval(timer)
        }
      }, this.adjustStepTime)
    },
    resumePlayerVolume(callback) {
      const step = (this.recodeVolume - this.currentVolume) / this.adjustExecuteTimes

      const timer = setInterval(() => {
        this.currentVolume += step

        if (this.currentVolume + step > this.recodeVolume) {
          clearInterval(timer)
          this.currentVolume = this.recodeVolume
          this.recodeVolume = null
          callback && callback()
        }
      }, this.adjustStepTime)
    },
    togglePlay() {
      this.player.togglePlay(this.deviceId).then(() => console.log('toggle play'))
    },
    nextTrack() {
      const minimalVolumeBackup = this.minimalVolume
      const adjustProcessTimeBackup = this.adjustProcessTime
      this.minimalVolume = 0
      this.adjustProcessTime = 2000

      this.reducePlayerVolume(
        this.player.nextTrack().then(() => {
          console.log('Skipped to next track!')
          this.resumePlayerVolume(() => {
            this.minimalVolume = minimalVolumeBackup
            this.adjustProcessTime = adjustProcessTimeBackup
          })
        })
      )
    },
    },
    activeThisDevice() {
      if (!this.$spotifyAPI.getAccessToken()) this.$spotifyAPI.setAccessToken(this.$store.getters.token)
      this.$spotifyAPI.transferMyPlayback([this.deviceId], { play: true }, error => {
        error && console.log(error.response)
        if (!error && !this.$store.getters.pendingQueue) {
          setTimeout(() => {
            this.$store.dispatch('sendNextQueue')
          }, 3000)
        }
      })
    },
  },
}
</script>
