<script lang="ts">
import { messageOutputMaker } from '@/utility/messageOutputMaker'
import IconSpeaker from '@/assets/icons/icon-announcing.svg?component'
import BaseMarquee from '@/components/base/BaseMarquee.vue'
import { computed } from 'vue'
import { useLatestOrderStore } from '@/store'

export default {
  components: {
    IconSpeaker,
    BaseMarquee,
  },
  setup() {
    const latestOrder = computed(() => useLatestOrderStore().latest_order)
    return {
      latestOrder,
      messageOutput: computed(() => {
        // fixme, latestOrder shoud be empty after current playing queue finish
        const trackName = latestOrder.value ? latestOrder.value.track_name : ''
        const note = latestOrder.value ? latestOrder.value.note : false
        return messageOutputMaker(note, trackName)
      }),
    }
  },
}
</script>
<template>
  <div id="marquee" class="flex flex-nowrap items-center overflow-hidden">
    <IconSpeaker />
    <BaseMarquee :text="messageOutput" class="ml-3 flex-1 text-natural-gray1" />
  </div>
</template>
