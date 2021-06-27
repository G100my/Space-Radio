<script>
import IconPlay from '@/assets/icons/icon-play.svg'
import IconPause from '@/assets/icons/icon-pause.svg'
import { isSpotifyPlayerPaused } from '../../composables/useSpotifyPlayer.js'
export default {
  components: {
    IconPlay,
    IconPause,
  },
  setup() {
    return isSpotifyPlayerPaused
  },
}
</script>
<template>
  <button
    id="play-status-button"
    class="flex items-center justify-center h-10 w-10 bg-primary rounded-full"
    type="button"
    :disabled="currentActiveDeviceId !== spotifyPlayerId"
    @click="togglePlay"
  >
    <IconPlay v-show="isSpotifyPlayerPaused" />
    <IconPause v-show="!isSpotifyPlayerPaused" />
  </button>
</template>
