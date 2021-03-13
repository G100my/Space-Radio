<template>
  <div class="create-room">
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
      <p class="room-name">
        <label for="room-name">Room name : </label>
        <input id="room-name" v-model="roomName" type="text" maxlength="50" />
        <span :class="{ active: hasSameRoomName }" class="warnning">already has room name: {{ roomName }}</span>
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
      <button
        type="button"
        class="create-button"
        :disabled="hasSameRoomName || roomName.length == 0"
        @click="createRoom"
      >
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
  },
  created() {
    this.roomName = this.userName + "'s Jukebox"
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
          host_id: this.userId,
          room_name: this.roomName,
          room_key: this.roomKey,
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
<style lang="scss">
.create-room {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 30px 20px;
  display: flex;
  flex-direction: column;

  form {
    flex: 1;
    display: inherit;
    flex-direction: inherit;
    justify-content: space-around;
  }

  p {
    display: flex;
    justify-content: flex-end;
    flex-direction: column;
    flex-wrap: wrap;
    width: 100%;
    > span {
      text-align: right;
    }
    &:nth-child(1),
    &:nth-child(2) {
      border-bottom: 2px solid var(--secondary-neutral);
    }
  }
  label {
    white-space: nowrap;
    width: 100%;
  }
  input {
    margin-top: 7px;
  }
  input[type='text'] {
    text-align: right;
    background-color: inherit;
    border: none;
    border-bottom: 2px solid var(--secondary-neutral);
    color: var(--primary-highlight);
    font-size: 1.2rem;
    &:focus {
      outline: none;
    }
  }
  .warnning {
    color: transparent;
    font-size: 10px;
  }
  .warnning.active {
    color: red;
  }
  .create-button {
    color: var(--secondary-neutral);
  }
  .create-button:disabled {
    text-decoration: line-through;
    color: var(--ignore);
    border-color: var(--ignore);
  }
}
</style>
