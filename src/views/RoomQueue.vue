<template>
  <!-- eslint-disable vue/html-self-closing eslint-disable vue/no-parsing-error-->
  <div class="room-queue">
    <h1>Room Tracks</h1>
    <TrackTable v-if="isReady">
      <Track v-for="(detailObject, key) in urgentTrack" :key="key" :info="detailObject">
        <div class="urgent" :data-key="key">
          <button type="button" @click="removeFromUrgent">removeFromUrgent</button>
          <button type="button" @click="editMessageAtUrgent">editMessageAtUrgent</button>
          <button type="button" @click="urgent2normal">urgent2normal</button>
        </div>
      </Track>
      <Track v-for="(detailObject, key) in normalTrack" :key="key" :info="detailObject">
        <div class="normal" :data-key="key">
          <button type="button" @click="removeFromNormal">removeFromNormal</button>
          <button type="button" @click="editMessageAtNormal">editMessageAtNormal</button>
          <button type="button" @click="normal2urgent">normal2urgent</button>
        </div>
      </Track>
    </TrackTable>
  </div>
</template>
<script>
import Track from '../components/Track.vue'
import TrackTable from '../components/TrackTable.vue'

export default {
  components: {
    Track,
    TrackTable,
  },
  data() {
    return {
      testNumber: 0,
      message: 'test string',
    }
  },
  computed: {
    normalTrack() {
      return this.$store.getters.normalTrackInfo
    },
    urgentTrack() {
      return this.$store.getters.urgentTrackInfo
    },
    normalQueue() {
      return this.$store.getters.normalQueue
    },
    urgentQueue() {
      return this.$store.getters.urgetnQueue
    },
    isReady() {
      return this.$store.getters.readyState
    },
  },
  methods: {
    removeFromUrgent(event) {
      const key = event.target.parentElement.dataset.key
      this.$store.dispatch('removeFromUrgent', key)
    },
    editMessageAtUrgent(event) {
      const key = event.target.parentElement.dataset.key
      const message = this.message
      this.$store.dispatch('editMessageAtUrgent', { key, message })
    },
    urgent2normal(event) {
      const key = event.target.parentElement.dataset.key
      this.$store.dispatch('urgent2normal', key)
    },
    removeFromNormal(event) {
      const key = event.target.parentElement.dataset.key
      this.$store.dispatch('removeFromNormal', key)
    },
    editMessageAtNormal(event) {
      const key = event.target.parentElement.dataset.key
      const message = this.message
      this.$store.dispatch('editMessageAtNormal', { key, message })
    },
    normal2urgent(event) {
      const key = event.target.parentElement.dataset.key
      const message = this.message
      this.$store.dispatch('normal2urgent', { key, message })
    },
  },
}
</script>
<style>
.normal button {
  background-color: pink;
}
.urgent button {
  background-color: lightskyblue;
}
</style>
