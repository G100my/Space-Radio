<template>
  <div class="player">
    <h1>player</h1>
    <p>device_id: {{ device_id }}</p>
    <div class="now-playing">
      <p />
    </div>
    <h2>SDK method</h2>
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
import '../utility/spotify-player-SDK.js'
import { getImplicitGrantToken } from '../utility/Oauth.js'

export default {
  props: {
    volume: {
      type: Number,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    executeBeforeEndTime: {
      type: Number,
      default: null,
    },
  },
  emits: ['nearTheEnd'],
  data() {
    return {
      player: null,
      device_id: null,
      name: 'test play',
      countDown: null,
      countDownTrackID: null,
    }
  },
  watch: {
    volume(newValue) {
      this.player.setVolume(newValue)
      console.log(newValue)
    },
  },
  created() {
    window.onSpotifyWebPlaybackSDKReady = () => {
      this.player = new window.Spotify.Player({
        name: this.name,
        getOAuthToken: cb => {
          cb(this.token)
        },
      })
      // prettier-ignore
      this.player.addListener('initialization_error', ({ message }) => { console.error(message) })
      // prettier-ignore
      this.player.addListener('account_error', ({ message }) => { console.error(message) })
      // prettier-ignore
      this.player.addListener('playback_error', ({ message }) => { console.error(message) })

      this.player.addListener('authentication_error', ({ message }) => {
        console.error(message)
        getImplicitGrantToken()
      })

      // Playback status updates
      this.player.addListener('player_state_changed', state => {
        console.log(state.track_window.current_track)
        console.log(state)

        if (!this.executeBeforeEndTime) return

        // 避免還在讀取時的 state
        const bufferTimer = state.duration - state.position - this.executeBeforeEndTime
        if (bufferTimer < 800) return

        if (
          (state.track_window.current_track.id != this.countDownTrackID && state.position > state.duration / 2) ||
          state.position == 0
        )
          return

        this.countDownTrackID = state.track_window.current_track.id

        console.log('setTimeout', Date.now())
        clearTimeout(this.countDown)
        this.countDown = setTimeout(() => {
          console.log('timeout!!!')
          this.$emit('nearTheEnd')
        }, bufferTimer)
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
      this.$spotifyAPI.transferMyPlayback([this.device_id], { play: true })
    },
  },
}
</script>
<style>
.player {
  padding-bottom: 30px;
  position: absolute;
  bottom: 0;
  width: 100vw;
  left: 0;
}
</style>
