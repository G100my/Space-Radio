<template>
  <div class="hall">
    <div class="hall-container">
      <div class="header">
        <h1>Jukebox</h1>
      </div>
      <div class="content">
        <label for="search-room-input">Room Name or Room Key</label>
        <input
          id="search-room-input"
          v-model="searchKeyWordInput"
          type="text"
          @focus="isErrorMessageShow = false"
          @keydown.prevent.enter="searchRoom"
        />
        <p v-if="isErrorMessageShow" class="error-message">Invalid Room Name or Room Key</p>
        <button type="button" @click="searchRoom">Next</button>
      </div>
      <div class="footer">
        <button type="button" @click="PKCE('#create')">Having no room? Create one!</button>
      </div>
    </div>
  </div>
</template>
<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import firebase from '../store/firebase.js'
import { PKCE } from '../utility/PKCE.js'

export default {
  setup() {
    const router = useRouter()
    const searchKeyWordInput = ref('')
    const isErrorMessageShow = ref(false)

    let roomListObject
    firebase
      .database()
      .ref('room_list')
      .get()
      .then(snapshot => {
        roomListObject = snapshot.val()
      })

    function searchRoom() {
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

    return {
      searchKeyWordInput,
      isErrorMessageShow,
      searchRoom,
      PKCE,
    }
  },
}
</script>
<style lang="scss">
.hall {
  flex: 1;
  box-sizing: border-box;
  background: gray;
  display: flex;
  align-items: center;
  justify-content: center;

  &-container {
    width: 60%;
  }
  .header {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    > h1 {
      font-size: 3rem;
    }
  }
  .content {
    display: flex;
    flex-direction: column;
  }
}
</style>
