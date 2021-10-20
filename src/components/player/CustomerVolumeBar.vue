<script>
import { spotifyAPI } from '@/utility/spotifyAPI'
import VolumnBar from '../VolumnBar.vue'
import { useCustomerSpotifyPlayer } from '@/composables/useSpotifyPlayer'
export default {
  components: {
    VolumnBar,
  },
  setup() {
    const { currentActiveDeviceId, customerPlayerVolume } = useCustomerSpotifyPlayer()
    function changedHandler(value) {
      spotifyAPI.setVolume(value, { device_id: currentActiveDeviceId.value }).then(() => {
        customerPlayerVolume.value = value
      })
    }
    return {
      customerPlayerVolume,
      changedHandler,

      currentActiveDeviceId,
    }
  },
}
</script>
<template>
  <VolumnBar
    :modelValue="customerPlayerVolume"
    :disabled="!currentActiveDeviceId"
    @update:change="changedHandler"
    @minus="changedHandler"
    @plus="changedHandler"
  />
</template>
