<template>
  <div class="room-queue">
    <h1>Room Tracks</h1>
    <button @click.prevent="testAdd">testAdd</button>
    <button @click.prevent="testRemoveFirst">testRemoveFirst</button>
    <table>
      <thead>
        <tr>
          <td>Cover</td>
          <td>Track / Artists</td>
          <td>Album</td>
          <td>Detail</td>
          <td>Feature</td>
        </tr>
      </thead>
      <tbody>
        <Track v-for="(detailObject, index) in detailObjects" :key="index" :info="detailObject" />
      </tbody>
    </table>
  </div>
</template>
<script>
import Track from './Track.vue'

export default {
  components: {
    Track,
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
