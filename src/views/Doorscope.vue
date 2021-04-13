<template>
  <div class="hall">
    <div class="hall-container">
      <div class="go-back">
        <router-link :to="{ name: 'Hall' }">Go Back</router-link>
      </div>
      <div class="header">
        <h2>{{ roomName }}</h2>
      </div>
      <div class="content">
        <img class="cover" :src="album.image_url === '' ? initCover : album.image_url" alt="" />
        <p v-if="trackName">
          <span>Now playing:</span>
          <span>{{ trackName }}</span>
        </p>
        <p v-else>This room is not playing any track now.</p>
        <button type="button" @click="PKCE('#room')">Enter Room with Spotify</button>
      </div>
    </div>
  </div>
</template>
<script>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import firebase from '../store/firebase.js'
import { PKCE } from '../utility/PKCE.js'
import initCover from '../assets/vinyl-record.png'

export default {
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
    }
  },
}
</script>
<style lang="scss"></style>
