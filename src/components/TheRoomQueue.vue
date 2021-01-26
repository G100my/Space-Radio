<template>
  <div class="tracks">
    <h1>Room Tracks</h1>
    <button @click.prevent="testAdd">testAdd</button>
    <button @click.prevent="testRemoveFirst">testRemoveFirst</button>
    <h2 v-for="(trackID, index) in $store.state.roomQueueID" :key="index">{{ trackID }}</h2>
  </div>
</template>
<script>
export default {
  data() {
    return {
      testNumber: 0,
    }
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
