<template>
  <div>
    <button type="button" @click="TTS">TTS</button>
    <button type="button" @click="playerResumeVolume">playerResumeVolume</button>
    <button type="button" @click="playQueue">playQueue</button>
    <input v-model="currentVolume" type="range" step="0.1" min="0" max="1" />
    <button type="button" @click="togglePlay">play</button>
    <button type="button" @click="next">next</button>
    <button type="button" @click="getCurrentState">getCurrentState</button>
    <button type="button" @click="getVolume">getVolume</button>
    <button type="button" @click="connect">connect</button>
    <button type="button" @click="activeThisDevice">activeThisDevice</button>
    <label>
      <span>Volume:</span>
      <input type="range" min="0" max="1" step=".05" @input="setVolume" />
    </label>
  </div>
</template>
<script>
// 載入歌單  調節播放
export default {
  data() {
    return {
      currentVolume: 1,
      recodeVolume: null,
      targetVolume: 0.1,
      executeBeforeEndTime: 10000,
      adjustTotalTime: 5000,
      adjustStepTime: 100,
      utterance: new window.SpeechSynthesisUtterance(),
      player: null,
      device_id: null,
      name: 'jukebox',
      countDown: null,
      sendNextQueueCoundDownTimer: null,
    }
  },
  computed: {
    hasNote2read() {
      return Boolean(this.currentNote)
    },
    adjustExecuteTimes() {
      return this.adjustTotalTime / this.adjustStepTime
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
    import('../../utility/spotify-player-SDK.js')
    window.onSpotifyWebPlaybackSDKReady = () => {
      this.player = new window.Spotify.Player({
        name: this.name,
        getOAuthToken: cb => {
          cb(this.$store.getters.token)
        },
      })
      this.player.addListener('initialization_error', ({ message }) => {
        console.error(message)
      })
      this.player.addListener('account_error', ({ message }) => {
        console.error(message)
      })
      this.player.addListener('playback_error', ({ message }) => {
        console.error(message)
      })

      this.player.addListener('authentication_error', ({ message }) => {
        console.error(message)
      })

      // Playback status updates
      this.player.addListener('player_state_changed', state => {
        console.log(state)
        // 斷開連結
        if (state === null) {
          this.$store.dispatch('clearPlayingTrack')
          return
        }

        const currentNoteId = state.track_window.current_track.id

        // 更新 playingState, 如果 playingState 的 track id 和 player 回傳的 id 不一樣
        if (currentNoteId !== this.$store.getters.currentPlayingTrackId) {
          const playingState = state.track_window.current_track
          this.$store.dispatch('updatePlayingTrack', { playingState })
          // 如果已經有 pending queue 而且跟現在正在撥放的是同一首歌，清空 pending
          if (this.$store.getters.pendingQueue && this.$store.getters.pendingQueue.id === currentNoteId) {
            this.$store.dispatch('previousPendingIsPlayed')
          }
        }

        // fixme 每次隨機狀態出現就刷新秒數，避免曲目被快轉，但又必須防止剛換曲目時極短時間內重複出現的狀態...
        if (this.sendNextQueueCoundDownTimer !== null) clearTimeout(this.sendNextQueueCoundDownTimer)
        if (state.position >= 1000 && !state.paused) {
          // 歌曲結束前 30 秒執行，超過就...下一次XD
          const timeout = state.duration - state.position - 30000
          if (this.$store.getters.leftQueueAmount !== 0 && timeout > 0) {
            this.sendNextQueueCoundDownTimer = setTimeout(() => {
              console.log('準備下一首~')
              this.$store.dispatch('sendNextQueue')
            }, timeout)
          }
        }

        if (this.hasNote2read) {
          if (state.position == 0) return

          const bufferTimer = state.duration - state.position - this.executeBeforeEndTime
          if (bufferTimer < 1000) return

          if (this.countDown) clearTimeout(this.countDown)
          this.countDown = setTimeout(() => {
            console.warn('廣播時間')
            this.reduceVolume(this.tts)
            this.countDown = null
          }, bufferTimer)
        }
      })

      // Ready
      this.player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id)
        this.device_id = device_id
      })

      // Not Ready
      this.player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id)
      })

      this.player.connect()
    }

    this.utterance.pitch = 1
    this.utterance.rate = 1
    this.utterance.volume = 1
    this.utterance.lang = 'zh-TW'
    this.utterance.onstart = () => {
      console.log('utterance start')
    }
    this.utterance.onend = () => {
      console.log('utterance end')
      this.playerResumeVolume()
    }
    this.utterance.onerror = event => {
      console.log('An error has occurred with the speech synthesis: ' + event.error)
    }
    speechSynthesis.onvoiceschanged = () => {
      console.log('onvoiceschanged')
      this.TTSsetVoice()
    }
  },
  methods: {
    TTSsetVoice() {
      const voice = speechSynthesis
        .getVoices()
        .find(item => item.name.includes('Google') && item.lang.includes('zh-TW'))
      if (voice !== null) this.utterance.voice = voice
    },
    TTS() {
      console.log(this.utterance)
      if (this.utterance.voice === null) this.TTSsetVoice()
      this.utterance.text = this.currentNote.message
      speechSynthesis.speak(this.utterance)
    },
    playerReduceVolume(callback) {
      this.recodeVolume = this.currentVolume

      const step = (this.currentVolume - this.targetVolume) / this.adjustExecuteTimes

      const timer = setInterval(() => {
        this.currentVolume -= step
        if (this.currentVolume < this.targetVolume) {
          callback()
          clearInterval(timer)
        }
      }, this.adjustStepTime)
    },
    playerResumeVolume() {
      const step = (this.recodeVolume - this.currentVolume) / this.adjustExecuteTimes

      const timer = setInterval(() => {
        this.currentVolume += step

        if (this.currentVolume + step > this.recodeVolume) {
          clearInterval(timer)
          this.currentVolume = this.recodeVolume
          this.recodeVolume = null
        }
      }, this.adjustStepTime)
    },
    playWholeQueue() {
      this.$spotifyAPI.play({ uris: this.$store.getters.getRoomQueueURIArray })
    },
    togglePlay() {
      this.player.togglePlay(this.device_id).then(() => console.log('toggle play'))
    },
    next() {
      this.player.nextTrack().then(() => console.log('Skipped to next track!'))
    },
    getCurrentState() {
      this.player.getCurrentState().then(state => {
        console.log('get Current State')
        if (!state) {
          console.error('User is not playing music through the Web Playback SDK')
          return
        }
        console.table(state)
      })
    },
    getVolume() {
      this.player.getVolume().then(volume => console.log(volume))
    },
    setVolume(event) {
      this.player.setVolume(event.target.value).then(() => {
        console.log(event.target.value)
      })
    },
    connect() {
      this.player.connect().then(success => console.log(success))
    },
    activeThisDevice() {
      if (!this.$spotifyAPI.getAccessToken()) this.$spotifyAPI.setAccessToken(this.$store.getters.token)
      this.$spotifyAPI.transferMyPlayback([this.device_id], { play: true }, error => {
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
