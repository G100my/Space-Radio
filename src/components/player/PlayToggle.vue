<script>
import IconPlay from '@/assets/icons/icon-play.svg'
import IconPause from '@/assets/icons/icon-pause.svg'
import {
  useHostSpotifyPlayer,
  useCustomerSpotifyPlayer,
  isThisSpotifyPlayerReady,
  isThisSpotifyPlayerPaused,
} from '@/composables/useSpotifyPlayer.js'

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
    }
  },
}
</script>
<template>
  <button
    id="play-status-button"
    class="flex items-center justify-center h-10 w-10 bg-primary rounded-full focus:outline-none focus:ring-2 focus:ring-natural-gray1 disabled:grayscale"
    :disabled="!isThisSpotifyPlayerReady || (!$props.isHostUser && !$store.getters.playerPlayingTrackUri)"
    type="button"
    @click="togglePlay"
  >
    <IconPlay v-show="isThisSpotifyPlayerPaused" />
    <IconPause v-show="!isThisSpotifyPlayerPaused" />
  </button>
</template>
