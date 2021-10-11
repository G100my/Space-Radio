<script>
import SpotifyLogo from '@/assets/images/Spotify_Logo_CMYK_Green.png'
import IconArrowRight from '@/assets/icons/icon-arrow-right.svg'

import { computed } from '@vue/runtime-core'
import { useStore } from 'vuex'

export default {
  name: 'AddFromStreamingService',
  components: {
    IconArrowRight,
  },
  emits: ['activeSideDrawer'],
  setup(_props, { emit }) {
    const store = useStore()

    function libraryClickHandler(type) {
      let listName, moduleName
      switch (type) {
        case 'liked':
          listName = 'Liked Songs from Spotify'
          moduleName = 'spotifyLiked'
          break
        case 'recently':
          listName = 'Recently played'
          moduleName = 'spotifyRecently'
          break
      }

      store.commit('chosenListName', listName)
      store.commit('chosenModule', { module: moduleName })
      emit('activeSideDrawer', 'PlaylistContent')
    }

    function playlistClickHandler(spotifyListId, spotifyListname) {
      store.commit('chosenListName', spotifyListname)
      store.commit('chosenModule', { module: 'spotifyList', specifyId: spotifyListId })
      emit('activeSideDrawer', 'PlaylistContent')
    }

    store.dispatch('getSpotifyLists')

    return {
      SpotifyLogo,
      libraryClickHandler,
      playlistClickHandler,
      spotify: computed(() => store.getters.spotifyLists),
    }
  },
}
</script>
<template>
  <div class="flex flex-col h-full">
    <header>
      <h2 class="text-natural-gray1 text-subtitle laptop:text-header">Add from Spotify</h2>
    </header>

    <div class="mt-10">
      <h3 class="mb-4 flex justify-between font-bold">
        <p class="text-natural-white">Your library</p>
        <img class="w-20" :src="SpotifyLogo" alt="Spotify logo" />
      </h3>
      <ul class="_side_drawer_ul">
        <li>
          <p>Liked Songs from Spotify</p>
          <button class="btn-tertiary" type="button" @click="libraryClickHandler('liked')">
            <IconArrowRight />
          </button>
        </li>
        <li>
          <p>Recently Played</p>
          <button class="btn-tertiary" type="button" @click="libraryClickHandler('recently')">
            <IconArrowRight />
          </button>
        </li>
      </ul>
    </div>

    <div class="mt-12 flex-1 overflow-y-auto flex flex-col">
      <h3 class="mb-4 flex justify-between font-bold">
        <p class="text-natural-white">Playlists</p>
        <img class="w-20" :src="SpotifyLogo" alt="Spotify logo" />
      </h3>
      <ul class="_side_drawer_ul">
        <li v-for="(playlist, index) in spotify" :key="index">
          <p>{{ playlist.name }}</p>
          <button class="btn-tertiary" type="button" @click="playlistClickHandler(playlist.id, playlist.name)">
            <IconArrowRight />
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>
<style lang="postcss" scoped>
._side_drawer_ul {
  @apply flex-1 overflow-y-auto space-y-4;
  li {
    @apply min-h-[70px] px-4 py-2 flex justify-between items-center rounded-10 bg-tertiary-1 bg-opacity-60;
  }
  p {
    @apply text-natural-white;
  }
}
</style>
