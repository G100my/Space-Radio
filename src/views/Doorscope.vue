<template>
  <div class="mt-24 mb-10 relative justify-self-start flex-1 flex flex-col justify-evenly">
    <BaseGoBackButton @click="$router.back()" />
    <h2 class="text-subtitle font-semibold mb-4">{{ roomName }}</h2>
    <img class="mx-auto max-w-xs max-h-40 mb-4" :src="album.image_url === '' ? initCover : album.image_url" />
    <p v-if="trackName">
      <span>Now playing:</span>
      <span>{{ trackName }}</span>
    </p>
    <p v-else class="text-center">This room is not playing any track now.</p>
    <button
      class="btn btn-spotify-bg-green w-full"
      type="button"
      @click="spotifyAPI.getAccessToken() ? $router.push({ name: 'Room' }) : PKCE('#room')"
    >
      Enter Room with Spotify
    </button>
  </div>
</template>
<script>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import firebase from '../store/firebase.js'
import { PKCE } from '../utility/PKCE.js'
import initCover from '../assets/vinyl-record.png'
import BaseGoBackButton from '../components/base/BaseGoBackButton.vue'
import { spotifyAPI } from '../plugin/spotify-web-api.js'

export default {
  components: {
    BaseGoBackButton,
  },
  setup() {
    const roomKey = useRoute().params.roomKey
    const store = useStore()
    const roomName = ref('')
    const album = computed(() => store.getters.playerPlayingAlbum)

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

    return {
      roomName,
      album,
      initCover,
      PKCE,
      trackName: computed(() => store.getters.playerPlayingTrackName),
      spotifyAPI,
    }
  },
}
</script>
<style lang="scss"></style>
