<script lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import firebase from '@/plugins/firebase'
import { PKCE } from '@/utility/PKCE'
import { spotifyAPI } from '@/plugins/spotifyAPI'
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
    const isRoomListReady = ref(false)

    let roomListObject: { [roomkey: string]: any } = {}

    const roomList = firebase.database().ref('room_list')

    roomList.on('value', snapshot => {
      roomListObject = snapshot.val()
      isRoomListReady.value = true
    })
    onBeforeUnmount(() => {
      firebase.database().ref('room_list').off()
      // 借助使用者刪除太久沒有使用的 room
      if (!roomListObject) return
      const deletedRooms = Object.entries(roomListObject).reduce<{ [roomKey: string]: any }>(
        (accumulator, [roomKey, value]) => {
          if (Date.now() - value.lastest_used > 30 * 24 * 60 * 60 * 1000) {
            accumulator[roomKey] = null
          }
          return accumulator
        },
        {}
      )
      firebase.database().ref().update(deletedRooms)
      firebase.database().ref('room_list').update(deletedRooms)
    })

    function searchRoom() {
      if (roomListObject === null) {
        isErrorMessageShow.value = true
        return
      }

      let roomKey: string = ''
      // 可以搜尋 room key 或者搜尋 room name
      if (Object.prototype.hasOwnProperty.call(roomListObject, searchKeyWordInput.value)) {
        roomKey = searchKeyWordInput.value
      } else {
        for (let key in roomListObject) {
          if (roomListObject[key].room_name === searchKeyWordInput.value) {
            roomKey = key
            break
          }
        }
      }
      if (!roomKey) {
        isErrorMessageShow.value = true
      } else {
        localStorage.setItem('spaceradio_room_key', roomKey)
        router.push({ name: 'Doorscope', params: { roomKey } })
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
      isRoomListReady,
    }
  },
}
</script>
<template>
  <div class="laptop:mt-[33vh]">
    <h2 class="text-subtitle">{{ t('enter_room') }}</h2>
    <label class="mt-6 block">
      <p class="font-bold text-natural-gray1">{{ t('room_name') }}<span class="text-primary">*</span></p>
      <div>
        <input
          v-model="searchKeyWordInput"
          class="base-input mt-1.5 w-full"
          type="text"
          :placeholder="isRoomListReady ? t('please_enter_room_name') : t('wait')"
          :disabled="!isRoomListReady"
          @focus="isErrorMessageShow = false"
          @keydown.prevent.enter="searchRoom"
        />
        <BaseAlert error :show="isErrorMessageShow" :title="`This room name not found.`" />
      </div>
    </label>
    <button class="btn-primary mt-5 w-full laptop:mt-11" type="button" @click="searchRoom">{{ t('next') }}</button>
    <button class="btn-secondary mt-3 w-full laptop:mt-4" type="button" @click="enterCreateHandler">
      {{ t('have_no_room') }}
    </button>
  </div>
  <HallNav class="laptop:mt-20" />
</template>
