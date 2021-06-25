<script>
import IconPlay from '@/assets/icons/play.svg'
import IconStop from '@/assets/icons/stop.svg'
import { isSpotifyPlayerPaused } from '../../composables/useSpotifyPlayer.js'
export default {
  components: {
    IconPlay,
    IconStop,
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
    <IconStop v-show="!isSpotifyPlayerPaused" />
  </button>
</template>
