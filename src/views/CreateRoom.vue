<template>
  <div class="">
    <h1>Create Room</h1>
    <form>
      <p>
        <label>Host id : </label>
        <span style="color: var(--ignore)">{{ userId }}</span>
      </p>
      <p>
        <label>Room Key : </label>
        <span style="color: var(--ignore)">{{ roomKey }}</span>
      </p>
      <p class="">
        <label for="room-name">Room name : </label>
        <input id="room-name" v-model.trim="roomName" type="text" maxlength="50" autocomplete="off" />
      </p>
      <p>
        <label for="init-volume"
          >Initail volume : <span>{{ volume }}</span></label
        >

        <input id="init-volume" v-model="volume" :min="minimalVolume" max="100" type="range" />
      </p>
      <p>
        <label for="minimal-volume"
          >Minimal volume : <span>{{ minimalVolume }}</span></label
        >
        <input id="minimal-volume" v-model="minimalVolume" min="0" max="100" type="range" />
      </p>
      <p>
        <label for="dislike-threshold"
          >Skip song threshold : <span>{{ dislikeThreshold }}</span></label
        >
        <input id="dislike-threshold" v-model="dislikeThreshold" min="1" max="5" type="range" />
      </p>
      <button type="button" class="" :disabled="hasSameRoomName || roomName.length == 0" @click="createRoom">
        Create room
      </button>
    </form>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import firebase from '../store/firebase.js'

export default {
  data() {
    return {
      roomKey: Array.from(window.crypto.getRandomValues(new Uint32Array(2)), item => item.toString(16)).join(''),
      roomName: '',
      volume: 50,
      minimalVolume: 10,
      dislikeThreshold: 2,
      roomNameArray: [],
    }
  },
  computed: {
    ...mapGetters(['userId', 'userName']),
    hasSameRoomName() {
      return this.roomNameArray.includes(this.roomName)
    },
    errorMessage() {
      if (this.hasSameRoomName) {
        return `already has room name: ${this.roomName}`
      } else if (this.roomName === '') {
        return `please enter your room name`
      } else {
        return false
      }
    },
  },
  created() {
    firebase.database().ref('room_list').on('value', this.roomListOnHandler)
  },
  methods: {
    roomListOnHandler(snapshot) {
      this.roomNameArray = Object.values(snapshot.val())
    },
    createRoom() {
      const room = firebase.database().ref(this.roomKey)
      room
        .set({
          basic: {
            host_id: this.userId,
            room_name: this.roomName,
            room_key: this.roomKey,
          },
          playing_state: {
            volume: this.volume,
            minimal_volume: this.minimalVolume,
            dislike_threshold: this.dislikeThreshold,
            dislike: 0,
          },
        })
        .then(() => {
          const room_list_ref = firebase.database().ref('room_list')
          room_list_ref.off('value', this.roomListOnHandler)

          const roomListObject = {}
          roomListObject[this.roomKey] = this.roomName
          room_list_ref.update(roomListObject)

          localStorage.setItem('jukebox_room_key', this.roomKey)
          this.$router.push({ name: 'Room' })
        })
    },
  },
}
</script>
