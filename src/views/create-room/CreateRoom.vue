<script>
import { computed, ref, watch, reactive } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import firebase from '@/store/firebase.js'
import { usePlusMinusHandler } from '@/composables/usePlusMinusHandler.js'
import { roomKeyMaker } from '@/utility/randomMaker.js'
import { spotifyAPI } from '@/utility/spotifyAPI.js'
import BaseAlert from '@/components/base/BaseAlert.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import VolumnBar from '@/components/VolumnBar.vue'
import IconArrowLeft from '@/assets/icons/icon-arrow-left.svg'
import IconPlus from '@/assets/icons/icon-plus.svg'
import IconMinus from '@/assets/icons/icon-minus.svg'
import IconClose from '@/assets/icons/icon/close.svg'

export default {
  components: {
    BaseAlert,
    BaseSelect,
    VolumnBar,
    IconArrowLeft,
    IconPlus,
    IconMinus,
    IconClose,
  },
  setup() {
    const roomKey = roomKeyMaker()
    const store = useStore()
    const userId = computed(() => store.getters.userId)
    const roomName = ref(null)
    const isVaild = ref(true)
    const router = useRouter()

    let roomNameArray = []

    const room_list_ref = firebase.database().ref('room_list')
    room_list_ref.on('value', snapshot => {
      const roomList = snapshot.val()
      if (roomList) {
        roomNameArray = Object.values(roomList)
      }
    })

    const hasSameRoomName = computed(() => roomNameArray.includes(roomName.value))

    const errorMessage = computed(() => {
      if (hasSameRoomName.value) {
        return `Room name exist: ${roomName.value}`
      } else {
        return `Can't be empty.`
      }
    })

    function checkRoomNameHandler() {
      isVaild.value = !hasSameRoomName.value && roomName.value !== ''
    }

    // function registerRoomNameHandler() {
    //   if (isVaild.value) {
    //     // 先加進去 room_list 以避免其他使用者同時間創立一樣 roomName
    //     const roomListObject = {}
    //     roomListObject[roomKey] = roomName.value
    //     room_list_ref.update(roomListObject)
    //   }
    // }
    // function unregisterHandler() {
    //   firebase.database().ref(`room_list/${room_key}`).remove()
    // }

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

    function createHandler() {
      checkRoomNameHandler()
      if (!isVaild.value) return
      firebase.database().ref(`room_list/${roomKey}`).set({
        room_name: roomName.value,
        lastest_used: Date.now(),
      })
      const room = firebase.database().ref(roomKey)
      room
        .set({
          basic: {
            base_playlist: basePlaylist.value,
            host_id: userId.value,
            room_key: roomKey,
            room_name: roomName.value,
          },
          playing_state: {
            volume: volume.value,
            minimal_volume: minimalVolume.value,
            dislike_threshold: dislikeThreshold.value,
            dislike: 0,
          },
        })
        .then(() => {
          localStorage.setItem('spaceradio_room_key', roomKey)
          router.push({ name: 'Room' })
        })
    }

    return {
      userId,
      roomKey,
      roomName,

      isVaild,
      hasSameRoomName,
      errorMessage,
      roomNameArray,

      checkRoomNameHandler,
      createHandler,

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
<template>
  <div class="py-4 my-auto">
    <h2 class="text-subtitle flex justify-between relative">
      <span>Create room</span>
      <button
        class="btn btn-tertiary laptop:-left-5 laptop:absolute laptop:-top-14"
        type="button"
        @click="$router.push({ name: 'Hall' })"
      >
        <IconArrowLeft class="hidden laptop:block" />
        <IconClose class="laptop:hidden" />
      </button>
    </h2>

    <form class="_create_room_form overflow-y-auto space-y-3 laptop:overflow-y-visible laptop:space-y-3">
      <div>
        <label for="room-name">Room name</label>
        <div>
          <input
            v-model.trim="roomName"
            class="base-input mt-1.5 w-full"
            maxlength="50"
            autocomplete="off"
            @keyup="checkRoomNameHandler"
          />
          <BaseAlert class="mb-1" error :title="errorMessage" :show="!isVaild" />
        </div>
      </div>

      <div>
        <label for="minimal-volume">Minimal Volume</label>
        <VolumnBar
          class="laptop:mt-3"
          :step="5"
          min="10"
          :modelValue="minimalVolume"
          @update:change="minimalVolumeInputHandler"
          @minus="minimalVolumeInputHandler"
          @plus="minimalVolumeInputHandler"
        />
      </div>

      <div>
        <label for="initial-volumn">Initial Volumn</label>
        <VolumnBar
          class="laptop:mt-3"
          :modelValue="volume"
          :min="minimalVolume"
          @update:change="volumeInputHandler"
          @minus="volumeInputHandler"
          @plus="volumeInputHandler"
        />
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
        <BaseSelect v-model="basePlaylist" :options="hostPlaylists" class="mt-2" />
      </div>

      <button class="btn btn-primary w-full mt-6 laptop:mt-8" type="button" @click="createHandler">Create</button>
    </form>
  </div>
</template>
<style lang="postcss">
._create_room_form {
  > div > label:first-child::after {
    content: '*';
    @apply text-primary mb-1;
  }
}
</style>
