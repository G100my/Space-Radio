<template>
  <div class="room">
    <PlayingState />
  </div>
</template>
<script>
import PlayingState from '../components/ThePlayingState.vue'
import { Queue as QueueStore, connect2FirebaseQueue } from '../store/Queue.js'

export default {
  components: {
    PlayingState,
  },
  beforeCreate() {
    if (!this.$store.hasModule('Queue')) {
      this.$store.registerModule('Queue', QueueStore)
      connect2FirebaseQueue(this.$store)
    }
  },
}
</script>
