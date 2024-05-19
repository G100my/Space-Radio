<script lang="ts" setup>
import { computed, ref, watch, nextTick } from 'vue'
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
import { Dialog as HDialog, DialogDescription, DialogOverlay, DialogTitle } from '@headlessui/vue'
import { usePersonalStore } from '@/store'

const roomKey = roomKeyMaker()
const userId = computed(() => usePersonalStore().user_id)
const roomName = ref('')
const isVaild = ref(true)
const router = useRouter()

interface FormattedRoomInfo {
  serial: string
  lastest_used: number
  room_name: string
}

const roomNameArray = ref<FormattedRoomInfo[]>([])

const room_list_ref = firebase.database().ref('room_list')
room_list_ref.on('value', snapshot => {
  const roomList = Object.entries(
    snapshot.val() as { [key: string]: { lastest_used: number; room_name: string } }
  ).reduce<FormattedRoomInfo[]>((acc, [key, value]) => {
    acc.push({ serial: key, ...value })
    return acc
  }, [])
  console.log('🚀 ~ file: CreateRoom.vue:29 ~ roomList:', roomList)
  if (roomList) {
    roomNameArray.value = roomList
  }
})

const hasSameRoomName = computed(() => roomNameArray.value.find(i => i.room_name === roomName.value))
const errorMessage = computed(() => (hasSameRoomName.value ? `Room name exist: ${roomName.value}` : `Can't be empty.`))

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

const { plus: plusDislikeThreshold, minus: minusDislikeThreshold } = usePlusMinusHandler(dislikeThreshold, 1, 1, 5)

//

let hostPlaylists = ref<{ id: string; name: string }[]>([])
const basePlaylist = ref(null)
spotifyAPI.getUserPlaylists(undefined, { limit: 50 }).then(res => {
  hostPlaylists.value = res.items.map(i => ({
    id: i.id,
    name: i.name,
  }))
})

//
const inviteURL = ref(`${location.origin}${location.pathname !== '/' ? location.pathname : '/'}#/doorscope/${roomKey}`)
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
</script>
<template>
  <div class="my-auto py-4">
    <h2 class="relative flex justify-between text-subtitle">
      <span>{{ $t('create_room') }}</span>
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
        <label for="room-name">{{ $t('room_name') }}</label>
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
        <label for="minimal-volume">{{ $t('minimal_volume') }}</label>
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
        <label for="initial-volumn">{{ $t('initial_volume') }}</label>
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
        <label>{{ $t('skip_song_threshold') }}</label>
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
        <p class="font-bold">{{ $t('choose_base_playlist_ref') }}</p>
        <BaseSelect v-model="basePlaylist" :options="hostPlaylists" class="mt-2" />
      </div>

      <button class="btn btn-primary mt-6 w-full laptop:mt-8" type="button" @click="createHandler">
        {{ $t('create') }}
      </button>
    </form>
  </div>
  <HDialog class="fixed inset-0 z-40 text-natural-gray4" :open="isOpen">
    <DialogOverlay as="p" class="fixed inset-0 -z-1 bg-tertiary-1 bg-opacity-60" />
    <div class="absolute inset-0 m-auto h-fit max-w-md rounded-md border-2 border-natural-gray2 bg-tertiary-1 p-4">
      <DialogTitle as="h2" class="text-center text-2xl">{{ $t('create_room_success') }}</DialogTitle>

      <hr class="mt-2 mb-6" />

      <DialogDescription class="text-center">{{ $t('you_can_copy_url_to_invite_your_friend') }}</DialogDescription>
      <div class="relative mt-4 flex w-full items-center justify-between">
        <input id="inviteURLInput" type="text" class="base-input" :value="inviteURL" readonly />
        <button class="btn-primary ml-auto p-2 leading-none" type="button" @click="copyInviteURLHandler">
          {{ $t('copy_again') }}
        </button>
      </div>

      <hr class="mt-2 mb-6" />
      <div class="flex justify-end">
        <button class="btn-secondary" @click="okHandler">OK</button>
      </div>
    </div>
  </HDialog>
</template>
<style>
._create_room_form > div > label:first-child::after {
  content: '*';
  @apply mb-1 text-primary;
}
</style>
