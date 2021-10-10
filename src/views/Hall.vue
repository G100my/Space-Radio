<script>
import { onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import firebase from '../store/firebase.js'
import { PKCE } from '../utility/PKCE.js'
import { spotifyAPI } from '../utility/spotifyAPI.js'
import BaseAlert from '@/components/base/BaseAlert.vue'
import HallNav from '@/components/hall/HallNav.vue'

export default {
  components: {
    BaseAlert,
    HallNav,
  },
  setup() {
    const router = useRouter()
    const searchKeyWordInput = ref('')
    const isErrorMessageShow = ref(false)

    let roomListObject = null

    firebase
      .database()
      .ref('room_list')
      .on('value', snapshot => {
        roomListObject = snapshot.val()
      })
    onBeforeUnmount(() => {
      firebase.database().ref('room_list').off()
    })

    function searchRoom() {
      if (roomListObject === null) {
        isErrorMessageShow.value = true
        return
      }

      let roomKey
      // 可以搜尋 room key 或者搜尋 room name
      if (Object.prototype.hasOwnProperty.call(roomListObject, searchKeyWordInput)) {
        roomKey = searchKeyWordInput
      } else {
        for (let key in roomListObject) {
          if (roomListObject[key] === searchKeyWordInput.value) {
            roomKey = key
            break
          }
        }
      }
      if (roomKey) {
        localStorage.setItem('spaceradio_room_key', roomKey)
        router.push({ name: 'Doorscope', params: { roomKey } })
      } else {
        isErrorMessageShow.value = true
      }
    }

    function enterCreateHandler() {
      spotifyAPI.getAccessToken() ? router.push({ name: 'CreateRoom' }) : PKCE('#create')
    }

    return {
      searchKeyWordInput,
      isErrorMessageShow,
      searchRoom,
      PKCE,
      enterCreateHandler,
    }
  },
}
</script>
<template>
  <div class="laptop:mt-[33vh]">
    <h2 class="text-subtitle">Enter Room</h2>
    <label class="block mt-6">
      <p class="text-natural-gray1 font-bold">Room name<span class="text-primary">*</span></p>
      <div>
        <input
          v-model="searchKeyWordInput"
          class="base-input mt-1.5 w-full"
          type="text"
          placeholder="Please enter room name."
          @focus="isErrorMessageShow = false"
          @keydown.prevent.enter="searchRoom"
        />
        <BaseAlert error :show="isErrorMessageShow" :title="`This room name not found.`" />
      </div>
    </label>
    <button class="btn-primary w-full mt-5 laptop:mt-11" type="button" @click="searchRoom">Next</button>
    <button class="btn-secondary w-full mt-3 laptop:mt-4" type="button" @click="enterCreateHandler">
      Having no room? Create Room
    </button>
  </div>
  <HallNav class="laptop:mt-20" />
</template>