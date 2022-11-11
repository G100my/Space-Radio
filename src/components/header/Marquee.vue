<script>
import { messageOutputMaker } from '@/utility/messageOutputMaker'
import IconSpeaker from '@/assets/icons/icon-announcing.svg'
import BaseMarquee from '@/components/base/BaseMarquee.vue'

export default {
  components: {
    IconSpeaker,
    BaseMarquee,
  },
  computed: {
    latestOrder() {
      return this.$store.getters.latestOrder
    },
    messageOutput() {
      // fixme, latestOrder shoud be empty after current playing queue finish
      const trackName = this.latestOrder ? this.latestOrder.track_name : null
      const note = this.latestOrder ? this.latestOrder.note : false
      return messageOutputMaker(note, trackName)
    },
  },
}
</script>
<template>
  <div id="marquee" class="flex flex-nowrap items-center overflow-hidden">
    <IconSpeaker />
    <BaseMarquee :text="messageOutput" class="ml-3 flex-1 text-natural-gray1" />
  </div>
</template>
