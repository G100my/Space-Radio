<template>
  <div class="room-queue">
    <h1>Room Tracks</h1>
    <button @click.prevent="testAdd">testAdd</button>
    <button @click.prevent="testRemoveFirst">testRemoveFirst</button>
    <TrackTable>
      <Track v-for="(detailObject, index) in detailObjects" :key="index" :info="detailObject" />
    </TrackTable>
  </div>
</template>
<script>
import Track from './Track.vue'
import TrackTable from './TrackTable.vue'

export default {
  components: {
    Track,
    TrackTable,
  },
  data() {
    return {
      testNumber: 0,
    }
  },
  computed: {
    idQueue() {
      return this.$store.state.trackIdQueue
    },
    detailObjects() {
      return this.$store.state.trackObjectArray
    },
  },
  methods: {
    testAdd() {
      this.$store.commit('room_queue_push', 'edvgredvbgtrdcvbgredcvbgrd')
    },
    testRemoveFirst() {
      this.$store.commit('room_queue_remove_first')
    },
  },
}
</script>
