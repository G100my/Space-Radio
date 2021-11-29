<script>
import { onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import firebase from '../store/firebase.js'
import { PKCE } from '../utility/PKCE.js'
import { spotifyAPI } from '../utility/spotifyAPI.js'
import BaseAlert from '@/components/base/BaseAlert.vue'
import HallNav from '@/components/hall/HallNav.vue'
import { useI18n } from 'vue-i18n'

export default {
  components: {
    BaseAlert,
    HallNav,
  },
  setup() {
    const { t } = useI18n()
    const router = useRouter()
    const searchKeyWordInput = ref('')
    const isErrorMessageShow = ref(false)

    let roomListObject = null

    const roomList = firebase.database().ref('room_list')

    roomList.on('value', snapshot => {
      roomListObject = snapshot.val()
    })
    onBeforeUnmount(() => {
      firebase.database().ref('room_list').off()
      // 借助使用者刪除太久沒有使用的 room
      const deletedRooms = Object.entries(roomListObject).reduce((accumulator, [roomKey, value]) => {
        if (Date.now() - value.lastest_used > 30 * 24 * 60 * 60 * 1000) {
          accumulator[roomKey] = null
        }
        return accumulator
      }, {})
      firebase.database().ref().update(deletedRooms)
      firebase.database().ref('room_list').update(deletedRooms)
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
          if (roomListObject[key].room_name === searchKeyWordInput.value) {
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
      t,
    }
  },
}
</script>
<template>
  <div class="laptop:mt-[33vh]">
    <h2 class="text-subtitle">Enter Room</h2>
    <label class="block mt-6">
      <p class="text-natural-gray1 font-bold">{{ t('room_name') }}<span class="text-primary">*</span></p>
      <div>
        <input
          v-model="searchKeyWordInput"
          class="base-input mt-1.5 w-full"
          type="text"
          :placeholder="t('please_enter_room_name')"
          @focus="isErrorMessageShow = false"
          @keydown.prevent.enter="searchRoom"
        />
        <BaseAlert error :show="isErrorMessageShow" :title="`This room name not found.`" />
      </div>
    </label>
    <button class="btn-primary w-full mt-5 laptop:mt-11" type="button" @click="searchRoom">Next</button>
    <button class="btn-secondary w-full mt-3 laptop:mt-4" type="button" @click="enterCreateHandler">
      {{ t('have_no_room') }}
    </button>
  </div>
  <HallNav class="laptop:mt-20" />
</template>
<i18n>
en:
  have_no_room: Having no room? Create Room.
  please_enter_room_name: Please enter room name.
zh:
  have_no_room: 開房間
  please_enter_room_name: 請輸入要進入的房間名稱
</i18n>
