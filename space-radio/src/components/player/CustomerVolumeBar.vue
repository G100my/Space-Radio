<script lang="ts">
import { spotifyAPI } from '@/plugins/spotifyAPI'
import VolumnBar from '../VolumnBar.vue'
import { useCustomerSpotifyPlayer } from '@/composables/useSpotifyPlayer'
export default {
  components: {
    VolumnBar,
  },
  setup() {
    const { currentActiveDeviceId, customerPlayerVolume } = useCustomerSpotifyPlayer()
    function changedHandler(value: number) {
      if (!currentActiveDeviceId.value) throw new Error('Current active device id is not exist.')

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
