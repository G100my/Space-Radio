<template>
  <div>
    <h1>Create Room</h1>
    <input v-model="roomName" type="text" />
    <input v-model="volume" type="number" />
    <input v-model="minimalVolume" type="number" />
    <input v-model="dislikeThreshold" type="number" />
    <button type="button" @click="createRoom">test</button>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import firebase from '../store/firebase.js'

export default {
  data() {
    return {
      roomName: '',
      volume: 50,
      minimalVolume: 10,
      dislikeThreshold: 2,
    }
  },
  computed: {
    ...mapGetters(['userId']),
  },
  methods: {
    createRoom() {
      const roomKey = Array.from(window.crypto.getRandomValues(new Uint32Array(2)), item => item.toString(16)).join('')

      const roomList = firebase.database().ref('room_list')
      const roomListObject = {}
      roomListObject[roomKey] = this.roomName
      roomList.update(roomListObject)

      const room = firebase.database().ref(roomKey)
      room
        .set({
          host_id: this.userId,
          room_name: this.roomName,
          room_key: roomKey,
          playing_state: {
            volume: this.volume,
            minimal_volume: this.minimalVolume,
            dislike_threshold: this.dislikeThreshold,
          },
        })
        .then(result => {
          console.log(result)
        })
    },
  },
}
</script>
