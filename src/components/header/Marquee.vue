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
    latestQueue() {
      return this.$store.getters.latestQueue
    },
    messageOutput() {
      // fixme, latestQueue shoud be empty after current playing queue finish
      const trackName = this.latestQueue ? this.latestQueue.track_name : null
      const note = this.latestQueue ? this.latestQueue.note : false
      return messageOutputMaker(note, trackName)
    },
  },
}
</script>
<template>
  <div id="marquee" class="flex items-center flex-nowrap overflow-hidden">
    <IconSpeaker />
    <BaseMarquee :text="messageOutput" class="flex-1 ml-3" />
  </div>
</template>
