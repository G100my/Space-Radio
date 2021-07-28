<script>
import IconPlay from '@/assets/icons/icon-play.svg'
import IconPause from '@/assets/icons/icon-pause.svg'
import {
  spotifyPlayer,
  isSpotifyPlayerPaused,
  currentActiveDeviceId,
  spotifyPlayerId,
} from '@/composables/useSpotifyPlayer.js'
import { computed } from 'vue'
import { useStore } from 'vuex'
export default {
  components: {
    IconPlay,
    IconPause,
  },
  setup() {
    const store = useStore()
    // fixme 怎樣直接能在 @click 綁訂 spotifyPlayer.togglePlay() ?
    function togglePlay() {
      spotifyPlayer.togglePlay()
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
    class="
      flex
      items-center
      justify-center
      h-10
      w-10
      bg-primary
      rounded-full
      focus:outline-none
      focus:ring-2 focus:ring-natural-gray1
    "
    :class="{ 'filter grayscale': currentActiveDeviceId !== spotifyPlayerId }"
    type="button"
    @click="togglePlay"
  >
    <IconPlay v-show="isSpotifyPlayerPaused" />
    <IconPause v-show="!isSpotifyPlayerPaused" />
  </button>
</template>
