<script>
import IconPlay from '@/assets/icons/icon-play.svg'
import IconPause from '@/assets/icons/icon-pause.svg'
import {
  spotifyPlayer,
  isSpotifyPlayerPaused,
  currentActiveDeviceId,
  spotifyPlayerId,
} from '@/composables/useSpotifyPlayer.js'
import { computed, unref } from 'vue'
import { useStore } from 'vuex'
import { spotifyAPI } from '@/utility/spotifyAPI'
export default {
  components: {
    IconPlay,
    IconPause,
  },
  setup() {
    const store = useStore()
    function togglePlay() {
      const device_id = unref(spotifyPlayerId)
      spotifyPlayer.getCurrentState().then(state => {
        if (!state) {
          console.warn('User is not playing music through the Web Playback SDK')
          spotifyAPI
            .transferMyPlayback([device_id])
            .then(() => spotifyAPI.getMyCurrentPlaybackState())
            .then(async response => {
              if (!response.shuffle_state) await spotifyAPI.setShuffle(true, { device_id })
              if (!response.repeat_state) await spotifyAPI.setRepeat('context')

              if (response.context.type !== 'playlist') {
                await spotifyAPI.play({ context_uri: `spotify:playlist:${store.getters.roomBasePlaylist}` })
              } else {
                spotifyPlayer.togglePlay()
              }
            })
            .then(() => spotifyAPI.getMyCurrentPlaybackState())
        } else {
          spotifyPlayer.togglePlay()
        }
      })
    }
    return {
      isSpotifyPlayerPaused,
      currentActiveDeviceId,
      spotifyPlayerId,
      togglePlay,
      isHost: computed(() => store.getters.isHostUser),
    }
  },
}
</script>
<template>
  <button
    v-if="isHost"
    id="play-status-button"
    class="flex items-center justify-center h-10 w-10 bg-primary rounded-full focus:outline-none focus:ring-2 focus:ring-natural-gray1"
    :class="{ 'filter grayscale': currentActiveDeviceId !== spotifyPlayerId }"
    type="button"
    @click="togglePlay"
  >
    <IconPlay v-show="isSpotifyPlayerPaused" />
    <IconPause v-show="!isSpotifyPlayerPaused" />
  </button>
</template>
