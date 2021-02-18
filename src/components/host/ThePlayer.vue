<template>
  <div class="player">
    <div>
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
  </div>
</template>
<script>
export default {
  props: {
    volume: {
      type: Number,
      required: true,
    },
    executeBeforeEndTime: {
      type: Number,
      default: 10000,
    },
    hasNote2read: {
      type: Boolean,
      required: false,
    },
  },
  emits: ['activetts'],
  data() {
    return {
      player: null,
      device_id: null,
      name: 'jukebox',
      countDown: null,
    }
  },
  computed: {
    token() {
      return this.$store.getters.token
    },
  },
  watch: {
    volume(newValue) {
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
          cb(this.token)
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

        // 更新 playingState, 如果 playingState 的 track id 和 player 回傳的 id 不一樣
        if (state.track_window.current_track.id !== this.$store.getters.currentPlayingTrackId) {
          const playingState = state.track_window.current_track
          this.$store.dispatch('updatePlayingTrack', { playingState })

          // 歌曲切換時、且只能一次的時機
          if (state.position === 0) {
            this.$store.dispatch('sendNextQueue')
          }
        }

        if (this.hasNote2read) {
          if (state.position == 0) return

          const bufferTimer = state.duration - state.position - this.executeBeforeEndTime
          if (bufferTimer < 1000) return

          console.log('setTimeout', Date.now())
          if (this.countDown) clearTimeout(this.countDown)

          this.countDown = setTimeout(() => {
            console.log('timeout!!!')
            this.$emit('activetts')
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
  },
  methods: {
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
      if (!this.$spotifyAPI.getAccessToken()) this.$spotifyAPI.setAccessToken(this.token)
      this.$spotifyAPI.transferMyPlayback([this.device_id], { play: true }, error => {
        error && console.log(error.response)
      })
    },
  },
}
</script>
<style>
.player {
}
</style>
