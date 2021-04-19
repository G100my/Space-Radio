<template>
  <HallShell>
    <div class="mt-24">
      <h2 class="text-subtitle font-semibold mb-4">Create room</h2>
      <form class="form">
        <p>
          <label>Host ID : </label>
          <input :value="userId" />
        </p>
        <p>
          <label>Room Key : </label>
          <input :value="roomKey" />
        </p>
        <p>
          <label for="room-name">Room name : </label>
          <input id="room-name" v-model.trim="roomName" type="text" maxlength="50" autocomplete="off" />
        </p>
        <button
          type="button"
          class="w-full p-2 text-spotify border-2 border-spotify rounded active:border-spotify active:bg-spotify active:text-white"
          :disabled="hasSameRoomName || roomName.length == 0"
          @click="createRoom"
        >
          Create room
        </button>
        <button type="button" class="tracking-tighter underline" @click="$router.push({ name: 'Hall' })">
          Enter an existing room!
        </button>
      </form>
    </div>
  </HallShell>
</template>
<script>
import { mapGetters } from 'vuex'
import firebase from '../../store/firebase.js'
import HallShell from '../../components/hall/HallShell.vue'

export default {
  components: {
    HallShell,
  },
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
<style lang="postcss">
.form {
  @apply space-y-4;
  & p {
    @apply flex flex-col;
    & label {
      @apply mb-2;
    }
    & input {
      @apply tracking-[-0.015rem] h-12 border-2 border-black p-2 pl-5 align-middle bg-[#E0E0E0];
    }
    &:nth-child(3) input {
      @apply bg-white;
    }
  }
}
</style>
