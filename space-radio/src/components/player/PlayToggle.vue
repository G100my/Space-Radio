<script lang="ts">
import IconPlay from '@/assets/icons/icon-play.svg?component'
import IconPause from '@/assets/icons/icon-pause.svg?component'
import {
  useHostSpotifyPlayer,
  useCustomerSpotifyPlayer,
  isThisSpotifyPlayerReady,
  isThisSpotifyPlayerPaused,
} from '@/composables/useSpotifyPlayer'
import { computed } from 'vue'
import { usePlayingStore } from '@/store'

export default {
  components: {
    IconPlay,
    IconPause,
  },
  props: {
    isHostUser: {
      type: Boolean,
      required: true,
    },
  },
  setup(props) {
    let specifyUse

    if (props.isHostUser) {
      specifyUse = useHostSpotifyPlayer
    } else {
      specifyUse = useCustomerSpotifyPlayer
    }

    const { togglePlay } = specifyUse()

    return {
      isThisSpotifyPlayerReady,
      isThisSpotifyPlayerPaused,
      togglePlay,
      playerPlayingTrackUri: computed(() => usePlayingStore().playerPlayingTrackUri),
    }
  },
}
</script>
<template>
  <button
    id="play-status-button"
    class="focus:outline-none flex h-10 w-10 items-center justify-center rounded-full bg-primary focus:ring-2 focus:ring-natural-gray1 disabled:grayscale"
    :disabled="!isThisSpotifyPlayerReady || (!$props.isHostUser && !!playerPlayingTrackUri)"
    type="button"
    @click="togglePlay"
  >
    <IconPlay v-show="isThisSpotifyPlayerPaused" />
    <IconPause v-show="!isThisSpotifyPlayerPaused" />
  </button>
</template>
