<script>
import IconPlay from '@/assets/icons/icon-play.svg'
import IconPause from '@/assets/icons/icon-pause.svg'
import {
  spotifyPlayer,
  isSpotifyPlayerPaused,
  currentActiveDeviceId,
  spotifyPlayerId,
} from '@/composables/useSpotifyPlayer.js'
export default {
  components: {
    IconPlay,
    IconPause,
  },
  setup() {
    // fixme 怎樣直接能在 @click 綁訂 spotifyPlayer.togglePlay() ?
    function togglePlay() {
      spotifyPlayer.togglePlay()
    }
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
    class="flex items-center justify-center h-10 w-10 bg-primary rounded-full disabled:filter disabled:grayscale"
    type="button"
    :disabled="currentActiveDeviceId !== spotifyPlayerId"
    @click="togglePlay"
  >
    <IconPlay v-show="isSpotifyPlayerPaused" />
    <IconPause v-show="!isSpotifyPlayerPaused" />
  </button>
</template>
