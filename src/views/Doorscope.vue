<script>
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import firebase from '../store/firebase.js'
import { PKCE } from '../utility/PKCE.js'
import { spotifyAPI } from '../utility/spotifyAPI.js'
import initCover from '../assets/vinyl-record.png'
import IconArrowLeft from '@/assets/icons/icon-arrow-left.svg'

export default {
  components: {
    IconArrowLeft,
  },
  setup() {
    const roomKey = useRoute().params.roomKey
    const store = useStore()
    const roomName = ref('')
    const album = computed(() => store.getters.playerPlayingAlbum)
    const enterButton = ref(null)

    const room_ref = firebase.database().ref(roomKey)
    room_ref
      .child('playing_state')
      .get()
      .then(snapshot => {
        const playingTrack = snapshot.val()['playing_track']
        store.commit('refreshPlayerTrack', playingTrack)
      })
    room_ref
      .child('basic/room_name')
      .get()
      .then(snapshot => {
        roomName.value = snapshot.val()
      })

    onMounted(() => {
      nextTick(() => {
        enterButton.value.focus()
      })
    })

    return {
      roomName,
      album,
      initCover,
      PKCE,
      trackName: computed(() => store.getters.playerPlayingTrackName),
      spotifyAPI,
      enterButton,
    }
  },
}
</script>
<template>
  <div class="laptop:relative laptop:mt-[33vh]">
    <button
      class="btn-tertiary self-start relative -left-5 -top-8 laptop:absolute laptop:-top-14"
      type="button"
      @click="$router.back()"
    >
      <IconArrowLeft />
    </button>
    <h2 class="text-subtitle mb-4">{{ roomName }}</h2>
    <!-- <img class="mx-auto max-w-xs max-h-40 mb-4" :src="album.image_url === '' ? initCover : album.image_url" /> -->
    <!-- <div v-if="trackName"> -->
    <p class="mt-8 font-bold text-natural-gray1 text-body">Now playing</p>
    <p class="mt-3 text-natural-gray1 text-body">{{ trackName }}</p>
    <!-- </div> -->
    <!-- <p v-else class="mt-8 text-natural-gray1 whitespace-nowrap">This room is not playing any track now.</p> -->
    <button
      ref="enterButton"
      class="mt-9 btn-primary w-full focus:ring-2"
      type="button"
      @click="spotifyAPI.getAccessToken() ? $router.push({ name: 'Room' }) : PKCE('#room')"
    >
      Enter
    </button>
  </div>
</template>
