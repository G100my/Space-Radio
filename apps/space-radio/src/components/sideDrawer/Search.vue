<script lang="ts">
import IconSearch from '@/assets/icons/icon-search.svg?component'
import IconSpinnerLoader from '@/assets/icons/icon-spinner-loader.svg?component'
import { onUnmounted, ref } from 'vue'
import { spotifyAPI } from '@/plugins/spotifyAPI'
import { playlistTrackFormater, type FormattedTrack } from '@/utility/dataFormat'
import TrackListContainer from './TrackListContainer.vue'
import { useInfinityScroll } from 'shared'
import { computed } from 'vue'

export default {
  components: {
    IconSearch,
    IconSpinnerLoader,
    TrackListContainer,
  },
  setup() {
    const list = ref<FormattedTrack[]>([])
    const keywords = ref('')
    const searchedAmount = ref(0)
    let next = ref('')
    const limit = 30
    function search(offset = 0) {
      return spotifyAPI.search(keywords.value, ['track'], { limit, offset }).then(response => {
        const formattedTracks: FormattedTrack[] = response.tracks!.items.map(playlistTrackFormater)

        list.value = list.value.concat(formattedTracks)
        next.value = response.tracks!.next
        searchedAmount.value = response.tracks!.total
      })
    }
    const nextCondition = computed(() => !!next.value)

    const { isLoading } = useInfinityScroll({
      containerID: 'infinity_search',
      nextCondition,
      fetchCallback: search,
    })

    const record = localStorage.getItem('spaceradio_recent_search')
    const recentSearchStrings = record ? JSON.parse(record) : []
    function searchClickHandler() {
      if (!recentSearchStrings.includes(keywords.value)) recentSearchStrings.push(keywords.value)
      if (recentSearchStrings.length > 30) recentSearchStrings.shift()
      list.value = []
      search()
    }

    onUnmounted(() => {
      localStorage.setItem('spaceradio_recent_search', JSON.stringify(recentSearchStrings))
    })
    return {
      list,
      keywords,
      recentSearchStrings,
      searchedAmount,
      searchClickHandler,
      isLoading,
      searchInput: ref<HTMLInputElement>(),
    }
  },
}
</script>
<template>
  <div class="flex min-h-full flex-col">
    <header class="flex items-center rounded-sm bg-[#253a77] px-5 py-2" @click="searchInput!.focus()">
      <button type="button" class="btn-tertiary" @click.stop="searchClickHandler">
        <IconSearch />
      </button>
      <input
        ref="searchInput"
        v-model="keywords"
        type="text"
        placeholder="Search artists & songs"
        class="_search_input"
        @keydown.enter="searchClickHandler"
        @keydown.esc="keywords = ''"
      />
    </header>

    <div v-show="!keywords" class="flex flex-auto flex-col">
      <p class="text-subtitle text-natural-gray2 my-5">Recent searches</p>

      <ul class="mt-7 h-0 flex-auto overflow-y-auto px-10">
        <li
          v-for="recent in recentSearchStrings"
          :key="recent"
          class="text-natural-gray2 hover:text-primary cursor-pointer py-3 transition-colors"
          @click=";(keywords = recent) && searchInput!.focus()"
        >
          {{ recent }}
        </li>
      </ul>
    </div>

    <div v-show="keywords" class="flex flex-auto flex-col">
      <div class="mt-5 flex items-baseline gap-x-1">
        <p class="text-natural-gray2 mr-auto font-bold">
          <span class="mx-2">{{ list.length }} / {{ searchedAmount }}</span>
          <span>results</span>
          <IconSpinnerLoader v-show="isLoading" class="text-natural-gray2 mx-2 inline-block animate-spin" />
        </p>
      </div>

      <TrackListContainer id="infinity_search" :list="list" class="mt-7 h-0 w-full flex-auto" />
    </div>
  </div>
</template>
<style>
._search_input {
  @apply text-natural-gray1 h-full flex-1 bg-transparent px-2;
}
._search_input::placeholder {
  @apply text-natural-gray3;
}
</style>
