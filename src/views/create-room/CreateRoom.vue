<template>
  <div>
    <h2 class="text-subtitle font-semibold">Create room</h2>
    <form class="create-room-form">
      <p>
        <label>Host ID : </label>
        <input disabled :value="userId" />
      </p>
      <p>
        <label>Room Key : </label>
        <input disabled :value="roomKey" />
      </p>
      <p>
        <label for="room-name">Room name : </label>
        <input
          id="room-name"
          v-model.trim="roomName"
          type="text"
          maxlength="50"
          autocomplete="off"
          class="ring-red-600 ring-offset-2"
          :class="{ 'ring-2': !isVaild }"
          @blur="checkRoomNameHandler"
          @input="checkRoomNameHandler"
        />
        <span class="text-red-500 font-semibold" :style="{ visibility: isVaild ? 'hidden' : 'visible' }">{{
          errorMessage
        }}</span>
      </p>
    </form>
    <button type="button" class="btn btn-spotify-bg-green w-full" @click="nextHandler">Create room</button>
    <button type="button" class="tracking-tighter underline mt-1" @click="$router.push({ name: 'Hall' })">
      Enter an existing room!
    </button>
  </div>
</template>
<script>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import firebase from '../../store/firebase.js'

export default {
  setup() {
    const roomKey = Array.from(window.crypto.getRandomValues(new Uint32Array(2)), item => item.toString(16)).join('')
    const userId = computed(() => useStore().getters.userId)
    const roomName = ref('')
    const isVaild = ref(true)
    const router = useRouter()

    let roomNameArray = []

    const room_list_ref = firebase.database().ref('room_list')
    room_list_ref.on('value', snapshot => {
      const roomList = snapshot.val()
      if (roomList !== null) {
        roomNameArray = Object.values(roomList)
      }
    })

    const hasSameRoomName = computed(() => roomNameArray.includes(roomName.value))

    const errorMessage = computed(() => {
      if (hasSameRoomName.value) {
        return `already has room name: ${roomName.value}`
      } else if (roomName.value === '') {
        return `please enter your room name`
      } else {
        return false
      }
    })

    function checkRoomNameHandler() {
      if (hasSameRoomName.value || roomName.value === '') {
        isVaild.value = false
      } else {
        isVaild.value = true
      }
    }

    function nextHandler() {
      checkRoomNameHandler()
      if (isVaild.value) {
        // 先加進去 room_list 以避免其他使用者同時間創立一樣 roomName
        const roomListObject = {}
        roomListObject[roomKey] = roomName.value
        room_list_ref.update(roomListObject)

        router.push({
          name: 'RoomSetting',
          params: {
            host_id: userId.value,
            room_key: roomKey,
            room_name: roomName.value,
          },
        })
      }
    }

    return {
      userId,
      roomKey,
      roomName,

      isVaild,
      hasSameRoomName,
      errorMessage,
      roomNameArray,
      nextHandler,
      checkRoomNameHandler,
    }
  },
}
</script>
<style lang="postcss">
.create-room-form {
  @apply space-y-4;
  p {
    @apply flex flex-col;
    &:nth-child(3) input {
      @apply bg-white;
    }
  }
  label {
    @apply mb-2;
  }
  input {
    @apply tracking-[-0.015rem] h-12 border-2 border-black p-2 pl-5 align-middle bg-[#E0E0E0];
  }
}
</style>
