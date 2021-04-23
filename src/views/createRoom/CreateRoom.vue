<template>
  <div class="mt-24">
    <h2 class="text-subtitle font-semibold mb-4">Create room</h2>
    <form class="form">
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
      <button
        type="button"
        class="w-full p-2 text-spotify border-2 border-spotify rounded active:border-spotify active:bg-spotify active:text-white"
        @click="nextHandler"
      >
        Create room
      </button>
      <button type="button" class="tracking-tighter underline" @click="$router.push({ name: 'Hall' })">
        Enter an existing room!
      </button>
    </form>
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

    firebase
      .database()
      .ref('room_list')
      .on('value', snapshot => (roomNameArray = Object.values(snapshot.val())))

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
        console.log('router push')
        router.push({ name: 'RoomSetting', params: { roomName: roomName.value } })
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
