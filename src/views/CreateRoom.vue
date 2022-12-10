<script lang="ts">
import { computed, ref, watch, reactive, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import firebase from '@/plugins/firebase'
import { usePlusMinusHandler } from '@/composables/usePlusMinusHandler'
import { roomKeyMaker } from '@/utility/randomMaker'
import { spotifyAPI } from '@/plugins/spotifyAPI'
import BaseAlert from '@/components/base/BaseAlert.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import VolumnBar from '@/components/VolumnBar.vue'
import IconArrowLeft from '@/assets/icons/icon-arrow-left.svg?component'
import IconPlus from '@/assets/icons/icon-plus.svg?component'
import IconMinus from '@/assets/icons/icon-minus.svg?component'
import IconClose from '@/assets/icons/icon/close.svg?component'
import { useI18n } from 'vue-i18n'
import { Dialog as HDialog, DialogDescription, DialogOverlay, DialogTitle } from '@headlessui/vue'
import { usePersonalStore } from '@/store'

export default {
  components: {
    BaseAlert,
    BaseSelect,
    VolumnBar,
    IconArrowLeft,
    IconPlus,
    IconMinus,
    IconClose,
    HDialog,
    DialogDescription,
    DialogOverlay,
    DialogTitle,
  },
  setup() {
    const roomKey = roomKeyMaker()
    const userId = computed(() => usePersonalStore().user_id)
    const roomName = ref('')
    const isVaild = ref(true)
    const router = useRouter()

    let roomNameArray: string[] = []

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

    function minimalVolumeInputHandler(eventValue: number) {
      if (eventValue >= minimalLimit) minimalVolume.value = Number(eventValue)
      else minimalVolume.value = minimalLimit
    }
    function volumeInputHandler(eventValue: number) {
      if (eventValue >= minimalVolume.value) volume.value = Number(eventValue)
      else volume.value = minimalVolume.value
    }

    const { plus: plusMinimal, minus: minusMinimal } = usePlusMinusHandler(minimalVolume, step, 10, 100)
    const { plus: plusVolume, minus: minusVolume } = usePlusMinusHandler(volume, step, minimalVolume.value, 100)
    const { plus: plusDislikeThreshold, minus: minusDislikeThreshold } = usePlusMinusHandler(dislikeThreshold, 1, 1, 5)

    //

    let hostPlaylists = reactive<{ id: string; name: string }[]>([])
    const basePlaylist = ref(null)
    spotifyAPI.getUserPlaylists(undefined, { limit: 50 }, (error, sucess) => {
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
    const inviteURL = ref(
      `${location.origin}${location.pathname !== '/' ? location.pathname : '/'}#/doorscope/${roomKey}`
    )
    console.log(inviteURL.value)
    const isOpen = ref(false)
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
          isOpen.value = true
          copyInviteURLHandler()
        })
    }

    function copyInviteURLHandler() {
      navigator.clipboard.writeText(inviteURL.value)
      nextTick(() => {
        document.getElementById('inviteURLInput')!.focus()
      })
    }

    function okHandler() {
      router.push({ name: 'Room' })
    }

    return {
      t: useI18n().t,
      userId,
      roomKey,
      roomName,

      isVaild,
      hasSameRoomName,
      errorMessage,
      roomNameArray,

      checkRoomNameHandler,
      createHandler,
      isOpen,
      inviteURL,
      copyInviteURLHandler,
      okHandler,

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
  <div class="my-auto py-4">
    <h2 class="relative flex justify-between text-subtitle">
      <span>{{ t('create_room') }}</span>
      <button
        class="btn btn-tertiary laptop:absolute laptop:-left-5 laptop:-top-14"
        type="button"
        @click="$router.push({ name: 'Hall' })"
      >
        <IconArrowLeft class="hidden laptop:block" />
        <IconClose class="laptop:hidden" />
      </button>
    </h2>

    <form class="_create_room_form space-y-3 overflow-y-auto laptop:space-y-3 laptop:overflow-y-visible">
      <div>
        <label for="room-name">{{ t('room_name') }}</label>
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
        <label for="minimal-volume">{{ t('minimal_volume') }}</label>
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
        <label for="initial-volumn">{{ t('initial_volume') }}</label>
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
        <label>{{ t('skip_song_threshold') }}</label>
        <p class="flex h-12 items-center rounded bg-tertiary-1 bg-opacity-60 px-2">
          <span class="mr-auto w-7 flex-shrink-0 text-center font-bold text-primary">{{ dislikeThreshold }}</span>
          <button class="btn btn-tertiary" type="button" @click="minusDislikeThreshold">
            <IconMinus />
          </button>
          <button class="btn btn-tertiary" type="button" @click="plusDislikeThreshold">
            <IconPlus />
          </button>
        </p>
      </div>

      <div>
        <p class="font-bold">{{ t('choose_base_playlist_ref') }}</p>
        <BaseSelect v-model="basePlaylist" :options="hostPlaylists" class="mt-2" />
      </div>

      <button class="btn btn-primary mt-6 w-full laptop:mt-8" type="button" @click="createHandler">
        {{ t('create') }}
      </button>
    </form>
  </div>
  <HDialog class="fixed inset-0 z-40 text-natural-gray4" :open="isOpen">
    <DialogOverlay as="p" class="fixed inset-0 -z-1 bg-tertiary-1 bg-opacity-60" />
    <div class="absolute inset-0 m-auto h-fit max-w-md rounded-md border-2 border-natural-gray2 bg-tertiary-1 p-4">
      <DialogTitle as="h2" class="text-center text-2xl">{{ t('create_room_success') }}</DialogTitle>

      <hr class="mt-2 mb-6" />

      <DialogDescription class="text-center">{{ t('you_can_copy_url_to_invite_your_friend') }}</DialogDescription>
      <div class="relative mt-4 flex w-full items-center justify-between">
        <input id="inviteURLInput" type="text" class="base-input" :value="inviteURL" readonly />
        <button class="btn-primary ml-auto p-2 leading-none" type="button" @click="copyInviteURLHandler">
          {{ t('copy_again') }}
        </button>
      </div>

      <hr class="mt-2 mb-6" />
      <div class="flex justify-end">
        <button class="btn-secondary" @click="okHandler">OK</button>
      </div>
    </div>
  </HDialog>
</template>
<style lang="postcss">
._create_room_form {
  > div > label:first-child::after {
    content: '*';
    @apply mb-1 text-primary;
  }
}
</style>
<i18n lang="yaml">
en:
  create_room: Create a room
  copy_again: Copy again!
  you_can_copy_url_to_invite_your_friend: You can invite your friends by send this URL to your friends.
  create_room_success: Create Room Success!
zh-TW:
  create_room: 建立房間
  copy_again: 再複製一次！
  you_can_copy_url_to_invite_your_friend: 傳給你的朋朋，邀請他們進來房間～不怕走錯棚～
  create_room_success: 開房間成功！
</i18n>
