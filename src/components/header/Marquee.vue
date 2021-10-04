<script>
import { messageOutputMaker } from '@/utility/messageOutputMaker.js'
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
  <div id="marquee" class="flex items-center flex-nowrap overflow-hidden">
    <IconSpeaker />
    <BaseMarquee :text="messageOutput" class="flex-1 ml-3 text-natural-gray1" />
  </div>
</template>
