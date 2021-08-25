<script>
import IconPlay from '@/assets/icons/icon-play.svg'
import IconPause from '@/assets/icons/icon-pause.svg'
import {
  isThisSpotifyPlayerPaused,
  currentActiveDeviceId,
  spotifyPlayerId,
  togglePlay,
} from '@/composables/useSpotifyPlayer.js'
import { useVoteWatch } from '@/composables/useVoteWatchControl.js'
export default {
  components: {
    IconPlay,
    IconPause,
  },
  setup() {
    useVoteWatch()
    return {
      isThisSpotifyPlayerPaused,
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
    <IconPlay v-show="isThisSpotifyPlayerPaused" />
    <IconPause v-show="!isThisSpotifyPlayerPaused" />
  </button>
</template>
