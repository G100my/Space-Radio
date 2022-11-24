<script lang="ts">
import SpotifyLogo from '@/assets/images/Spotify_Logo_CMYK_Green.png'
import IconArrowRight from '@/assets/icons/icon-arrow-right.svg?component'

import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePersonalPlaylistStore, type PersonalPlaylistStoreState } from '@/store'

export default {
  name: 'AddFromStreamingService',
  components: {
    IconArrowRight,
  },
  emits: ['activeSideDrawer'],
  setup(_props, { emit }) {
    const store = usePersonalPlaylistStore()
    const { t } = useI18n()

    function libraryClickHandler(type: PersonalPlaylistStoreState['chosenModule']) {
      let listName
      switch (type) {
        case 'spotifyLiked':
          listName = t('list_name.liked_songs_from_spotify')
          break
        case 'spotifyRecently':
          listName = t('list_name.recently_played')
          break
        case 'spotifyLong':
          listName = t('list_name.your_totally_top_tracks')
          break
        case 'spotifyMedium':
          listName = t('list_name.your_top_tracks_in_last_6_months')
          break
        case 'spotifyShort':
          listName = t('list_name.your_top_tracks_in_last_month')
          break
      }

      store.chosenName = listName
      store.chosenModule = type
      emit('activeSideDrawer', 'PlaylistContent')
    }

    function playlistClickHandler(spotifyListId: string, spotifyListname: string) {
      store.chosenName = spotifyListname
      store.$patch({ chosenModule: 'spotifyList', specifyId: spotifyListId })
      emit('activeSideDrawer', 'PlaylistContent')
    }

    store.getSpotifyLists()

    return {
      SpotifyLogo,
      libraryClickHandler,
      playlistClickHandler,
      spotify: computed(() => store.spotifyPlaylists),
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
          <li @click="libraryClickHandler('spotifyLiked')">
            <p>{{ t('liked_songs_from_spotify') }}</p>
            <IconArrowRight />
          </li>
          <li @click="libraryClickHandler('spotifyRecently')">
            <p>{{ t('recently_played') }}</p>
            <IconArrowRight />
          </li>
          <li @click="libraryClickHandler('spotifyLong')">
            <p>{{ t('your_totally_top_tracks') }}</p>
            <IconArrowRight />
          </li>
          <li @click="libraryClickHandler('spotifyMedium')">
            <p>{{ t('your_top_tracks_in_last_6_months') }}</p>
            <IconArrowRight />
          </li>
          <li @click="libraryClickHandler('spotifyShort')">
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
