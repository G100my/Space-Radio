<script>
import SpotifyLogo from '@/assets/images/Spotify_Logo_CMYK_Green.png'
import IconArrowRight from '@/assets/icons/icon-arrow-right.svg'

import { computed } from '@vue/runtime-core'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'

export default {
  name: 'AddFromStreamingService',
  components: {
    IconArrowRight,
  },
  emits: ['activeSideDrawer'],
  setup(_props, { emit }) {
    const store = useStore()
    const { t } = useI18n()

    function libraryClickHandler(type) {
      let listName, moduleName
      switch (type) {
        case 'liked':
          listName = t('liked_songs_from_spotify')
          moduleName = 'spotifyLiked'
          break
        case 'recently':
          listName = t('recently_played')
          moduleName = 'spotifyRecently'
          break
        case 'long_term':
          listName = t('your_totally_top_tracks')
          moduleName = 'spotifyLong'
          break
        case 'medium_term':
          listName = t('your_top_tracks_in_last_6_months')
          moduleName = 'spotifyMedium'
          break
        case 'short_term':
          listName = t('your_top_tracks_in_last_month')
          moduleName = 'spotifyShort'
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
      t,
    }
  },
}
</script>
<template>
  <div class="flex h-full flex-col">
    <header>
      <h2 class="text-subtitle text-natural-gray1 laptop:text-header">{{ t('add_from_spotify') }}</h2>
    </header>

    <div class="mt-4 flex flex-1 flex-col overflow-hidden">
      <div class="flex flex-1 flex-col overflow-y-hidden">
        <h3 class="mb-4 flex justify-between font-bold">
          <p class="text-natural-white">{{ t('your_library') }}</p>
          <img class="w-20" :src="SpotifyLogo" alt="Spotify logo" />
        </h3>
        <ul class="_side_drawer_ul">
          <li @click="libraryClickHandler('liked')">
            <p>{{ t('liked_songs_from_spotify') }}</p>
            <IconArrowRight />
          </li>
          <li @click="libraryClickHandler('recently')">
            <p>{{ t('recently_played') }}</p>
            <IconArrowRight />
          </li>
          <li @click="libraryClickHandler('long_term')">
            <p>{{ t('your_totally_top_tracks') }}</p>
            <IconArrowRight />
          </li>
          <li @click="libraryClickHandler('medium_term')">
            <p>{{ t('your_top_tracks_in_last_6_months') }}</p>
            <IconArrowRight />
          </li>
          <li @click="libraryClickHandler('short_term')">
            <p>{{ t('your_top_tracks_in_last_month') }}</p>
            <IconArrowRight />
          </li>
        </ul>
      </div>

      <div class="mt-4 flex flex-1 flex-col overflow-y-hidden">
        <h3 class="mb-4 flex justify-between font-bold">
          <p class="text-natural-white">{{ t('playlists') }}</p>
          <img class="w-20" :src="SpotifyLogo" alt="Spotify logo" />
        </h3>
        <ul class="_side_drawer_ul">
          <li
            v-for="(playlist, index) in spotify"
            :key="index"
            @click="playlistClickHandler(playlist.id, playlist.name)"
          >
            <p>{{ playlist.name }}</p>
            <IconArrowRight />
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<style lang="postcss" scoped>
._side_drawer_ul {
  @apply flex-1 space-y-4 overflow-y-auto;
  li {
    @apply flex min-h-[70px] cursor-pointer items-center justify-between rounded-10 bg-tertiary-1 py-2 pl-4 pr-10;
    & > svg {
      @apply transition;
    }
    &:hover > svg {
      @apply translate-x-4 transform;
    }
  }
  p {
    @apply text-natural-white;
  }
}
</style>
