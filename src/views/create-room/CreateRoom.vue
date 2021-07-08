<template>
  <div class="py-4 my-auto">
    <button
      class="btn btn-tertiary hidden self-start laptop:flex laptop:-left-5 laptop:absolute laptop:-top-14"
      type="button"
      @click="$router.push({ name: 'Hall' })"
    >
      <IconArrowLeft />
    </button>
    <h2 class="text-subtitle flex justify-between">
      <span>Create room</span>
      <button class="btn btn-tertiary laptop:hidden" type="button" @click="$router.push({ name: 'Hall' })">
        <IconClose />
      </button>
    </h2>

    <form class="create-room-form overflow-y-auto space-y-3">
      <div>
        <label for="room-name">Room name</label>
        <BaseInput
          id="room-name"
          v-model.trim="roomName"
          maxlength="50"
          autocomplete="off"
          @blur="checkRoomNameHandler"
          @input="checkRoomNameHandler"
        >
          <BaseAlert class="mb-1" error :title="errorMessage" :show="isVaild" />
        </BaseInput>
      </div>

      <div>
        <label for="minimal-volume">Minimal Volume</label>
        <VolumnBar :step="5" :model-value="minimalVolume" @update:change="minimalVolumeInputHandler" />
      </div>

      <div>
        <label for="initial-volumn">Initial Volumn</label>
        <VolumnBar :model-value="volume" @update:change="volumeInputHandler" />
      </div>

      <div>
        <label>Skip Song threshold</label>
        <p class="h-12 bg-tertiary-1 bg-opacity-60 rounded px-2 flex items-center">
          <span class="mr-auto text-primary font-bold w-7 flex-shrink-0 text-center">{{ dislikeThreshold }}</span>
          <button class="btn btn-tertiary" type="button" @click="minusDislikeThreshold">
            <IconMinus />
          </button>
          <button class="btn btn-tertiary" type="button" @click="plusDislikeThreshold">
            <IconPlus />
          </button>
        </p>
      </div>

      <div>
        <p class="font-bold">Choose a playlist as recommendation references</p>
        <BaseSelect :options="hostPlaylists" class="mt-2" />
      </div>
      <button class="btn btn-primary w-full mt-6" type="button" @click="createHandler">Create</button>
    </form>
  </div>
</template>
<script>
import { computed, ref, watch, reactive } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import firebase from '../../store/firebase.js'
import { usePlusMinusHandler } from '../../composables/usePlusMinusHandler.js'
import { spotifyAPI } from '../../utility/spotifyAPI.js'
import BaseAlert from '@/components/base/BaseAlert.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import VolumnBar from '@/components/VolumnBar.vue'
import IconArrowLeft from '@/assets/icons/icon-arrow-left.svg'
import IconPlus from '@/assets/icons/icon-plus.svg'
import IconMinus from '@/assets/icons/icon-minus.svg'
import IconClose from '@/assets/icons/icon/close.svg'

export default {
  components: {
    BaseInput,
    BaseAlert,
    BaseSelect,
    VolumnBar,
    IconArrowLeft,
    IconPlus,
    IconMinus,
    IconClose,
  },
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
        return `Room name exist: ${roomName.value}`
      } else if (roomName.value === '') {
        return `Can't be empty.`
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

    const dislikeThreshold = ref(2)
    const volume = ref(50)
    const minimalVolume = ref(10)
    const step = 5
    const minimalLimit = 10
    watch(minimalVolume, newValue => {
      if (volume.value < newValue) volume.value = newValue
    })

    function minimalVolumeInputHandler(eventValue) {
      if (eventValue >= minimalLimit) minimalVolume.value = Number(eventValue)
      else minimalVolume.value = minimalLimit
    }
    function volumeInputHandler(eventValue) {
      if (eventValue >= minimalVolume.value) volume.value = Number(eventValue)
      else volume.value = minimalVolume.value
    }

    const { plus: plusMinimal, minus: minusMinimal } = usePlusMinusHandler(minimalVolume, step, 10, 100)
    const { plus: plusVolume, minus: minusVolume } = usePlusMinusHandler(volume, step, minimalVolume, 100)
    const { plus: plusDislikeThreshold, minus: minusDislikeThreshold } = usePlusMinusHandler(dislikeThreshold, 1, 1, 5)

    //

    let hostPlaylists = reactive([])
    const basePlaylist = ref(null)
    spotifyAPI.getUserPlaylists({ limit: 50 }, (error, sucess) => {
      if (error) {
        console.warn('something wrong when try to get host playlist.')
        return
      }
      sucess.items.forEach(item => {
        hostPlaylists.push({
          id: item.id,
          name: item.name,
        })
      })
    })

    //

    const params = useRoute().params
    const room_key = params.room_key
    function unregisterHandler() {
      firebase.database().ref(`room_list/${room_key}`).remove()
      window.removeEventListener('beforeunload', unregisterHandler)
    }

    window.addEventListener('beforeunload', unregisterHandler)

    function createHandler() {
      const room = firebase.database().ref(room_key)
      room
        .set({
          basic: { base_playlist: basePlaylist.value, ...params },
          playing_state: {
            volume: volume.value,
            minimal_volume: minimalVolume.value,
            dislike_threshold: dislikeThreshold.value,
            dislike: 0,
          },
        })
        .then(() => {
          localStorage.setItem('jukebox_room_key', room_key)
          window.removeEventListener('beforeunload', unregisterHandler)
          router.push({ name: 'Room' })
        })
    }

    const testvalue = ref(0)

    return {
      testvalue,

      userId,
      roomKey,
      roomName,

      isVaild,
      hasSameRoomName,
      errorMessage,
      roomNameArray,
      nextHandler,
      checkRoomNameHandler,

      createHandler,
      unregisterHandler,

      volume,
      minimalVolume,
      dislikeThreshold,
      step,

      minimalVolumeInputHandler,
      volumeInputHandler,

      plusVolume,
      minusVolume,
      plusMinimal,
      minusMinimal,
      plusDislikeThreshold,
      minusDislikeThreshold,

      hostPlaylists,
      basePlaylist,
    }
  },
}
</script>
<style lang="postcss">
.create-room-form {
  > div > label:first-child::after {
    content: '*';
    @apply text-primary mb-1;
  }
}
</style>
