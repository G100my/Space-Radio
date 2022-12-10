<script lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import firebase from '@/plugins/firebase'
import { PKCE } from '@/utility/PKCE'
import { spotifyAPI } from '@/plugins/spotifyAPI'
import initCover from '@/assets/vinyl-record.png'
import IconArrowLeft from '@/assets/icons/icon-arrow-left.svg?component'
import { useI18n } from 'vue-i18n'
import { usePlayingStore } from '@/store'

export default {
  components: {
    IconArrowLeft,
  },
  setup() {
    const { t } = useI18n()
    const playingStore = usePlayingStore()
    const roomKey = useRoute().params.roomKey as string
    const roomName = ref('')
    const album = computed(() => playingStore.playing_track.album)
    const enterButton = ref<HTMLButtonElement>()

    const room_ref = firebase.database().ref(roomKey)
    room_ref
      .child('playing_state')
      .get()
      .then(snapshot => {
        const playingTrack = snapshot.val()['playing_track']
        playingStore.updatePlayerTrack(playingTrack)
      })
    room_ref
      .child('basic/room_name')
      .get()
      .then(snapshot => {
        roomName.value = snapshot.val()
      })

    onMounted(() => {
      nextTick(() => {
        enterButton.value!.focus()
      })
    })

    return {
      roomName,
      album,
      initCover,
      PKCE,
      trackName: computed(() => playingStore.playing_track.name),
      spotifyAPI,
      enterButton,
      t,
    }
  },
}
</script>
<template>
  <div class="laptop:relative laptop:mt-[33vh]">
    <button
      class="btn-tertiary relative -left-5 -top-8 self-start laptop:absolute laptop:-top-14"
      type="button"
      @click="$router.back()"
    >
      <IconArrowLeft />
    </button>
    <h2 class="mb-4 text-subtitle">{{ roomName }}</h2>
    <!-- <img class="mx-auto max-w-xs max-h-40 mb-4" :src="album.image_url === '' ? initCover : album.image_url" alt="" /> -->
    <!-- <div v-if="trackName"> -->
    <p class="mt-8 text-body font-bold text-natural-gray1">{{ t('now_playing') }}:</p>
    <p class="mt-3 text-body text-natural-gray1">{{ trackName }}</p>
    <!-- </div> -->
    <!-- <p v-else class="mt-8 text-natural-gray1 whitespace-nowrap">This room is not playing any track now.</p> -->
    <button
      ref="enterButton"
      class="btn-primary mt-9 w-full focus:ring-2"
      type="button"
      @click="spotifyAPI.getAccessToken() ? $router.push({ name: 'Room' }) : PKCE('#room')"
    >
      {{ t('enter') }}
    </button>
  </div>
</template>
<i18n lang="yaml">
en:
  now_playing: Now playing
zh-TW:
  now_playing: 現正撥放
</i18n>
