<script>
import IconPlay from '@/assets/icons/icon-play.svg'
import IconPause from '@/assets/icons/icon-pause.svg'
import {
  isSpotifyPlayerPaused,
  currentActiveDeviceId,
  spotifyPlayerId,
  togglePlay,
} from '@/composables/useSpotifyPlayer.js'
export default {
  components: {
    IconPlay,
    IconPause,
  },
  setup() {
    return {
      isSpotifyPlayerPaused,
      currentActiveDeviceId,
      spotifyPlayerId,
      togglePlay,
    }
  },
}
</script>
<template>
  <button
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
