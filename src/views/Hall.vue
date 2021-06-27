<template>
  <div class="sm:mt-14 flex flex-col">
    <h2 class="text-subtitle font-semibold mb-4">Enter Room</h2>
    <label class="text-gray-400 mb-5">
      <p>Room Name or Room Key</p>
      <input
        id="search-room-input"
        v-model="searchKeyWordInput"
        class="p-3 w-full border-2 border-black"
        type="text"
        @focus="isErrorMessageShow = false"
        @keydown.prevent.enter="searchRoom"
      />
      <p class="text-red-600" :style="{ visibility: isErrorMessageShow ? 'visible' : 'hidden' }">
        Invalid Room Name or Room Key
      </p>
    </label>
    <button class="btn btn-spotify-bg-white mb-2" type="button" @click="searchRoom">Next</button>
    <button class="text-left hover:underline" type="button" @click="enterCreateHandler">
      Having no room? Create one!
    </button>
  </div>
</template>
<script>
import { onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import firebase from '../store/firebase.js'
import { PKCE } from '../utility/PKCE.js'
import { spotifyAPI } from '../utility/spotify-web-api.js'

export default {
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
        localStorage.setItem('jukebox_room_key', roomKey)
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
