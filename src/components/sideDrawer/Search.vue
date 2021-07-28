<script>
import IconSearch from '@/assets/icons/icon-search.svg'
import IconFilter from '@/assets/icons/icon-filter.svg'
import IconPlus from '@/assets/icons/icon-plus.svg'
import IconArrowUp from '@/assets/icons/icon-arrow-up.svg'
import { onUnmounted, ref } from 'vue'
import { spotifyAPI } from '@/utility/spotifyAPI'
import { spotifyCoverPicker } from '@/utility/dataFormat'
import BaseMarquee from '../base/BaseMarquee.vue'

export default {
  components: {
    IconSearch,
    IconFilter,
    IconPlus,
    IconArrowUp,
    BaseMarquee,
  },
  setup() {
    const list = ref([])
    const refineMode = ref(false)
    const recentSearchStrings = JSON.parse(localStorage.getItem('jukebox_recent_search')) || []
    const next = ref('')
    const keywords = ref('')
    const total = ref(0)
    let offset = 0

    function searchClickHandler() {
      console.log('🚀 ~ file: Search.vue ~ line 24 ~ searchClickHandler ~ searchClickHandler', searchClickHandler)

      recentSearchStrings.push(keywords.value)
      search()
    }

    function search(offset = 0) {
      return spotifyAPI.search(keywords.value, ['track'], { limit: 50, offset }).then(response => {
        response.tracks.items.forEach(i => (i.album.coverUrl = spotifyCoverPicker(i.album.images)))
        list.value = list.value.concat(response.tracks.items)
        next.value = response.tracks.next
        total.value = response.tracks.total
        offset = response.tracks.offset
      })
    }

    function clearRefineHandler() {
      console.log('🚀 ~ file: Search.vue ~ line 37 ~ clearRefineHandler ~ clearRefineHandler', clearRefineHandler)
      // refineMode.value = false
    }

    function sortByNewHandler() {
      console.log('🚀 ~ file: Search.vue ~ line 42 ~ sortByNewHandler ~ sortByNewHandler', sortByNewHandler)
    }

    function filterHandler() {
      console.log('🚀 ~ file: Search.vue ~ line 46 ~ filterHandler ~ filterHandler', filterHandler)
      //
    }

    onUnmounted(() => {
      localStorage.setItem('jukebox_recent_search', JSON.stringify(recentSearchStrings))
    })
    return {
      list,
      keywords,
      recentSearchStrings,
      next,
      total,
      refineMode,
      searchClickHandler,
      filterHandler,
      clearRefineHandler,
      sortByNewHandler,
    }
  },
}
</script>
<template>
  <div class="flex flex-col min-h-full">
    <header class="flex items-center px-5 py-2 bg-[#253a77] rounded-sm" @click="$refs.searchInput.focus()">
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

    <div v-show="!keywords" class="flex-auto flex flex-col">
      <p class="my-5 text-subtitle text-natural-gray2">Recent searches</p>

      <ul class="flex-1 mt-7 overflow-y-auto px-10">
        <li
          v-for="recent in recentSearchStrings"
          :key="recent"
          class="py-3 text-natural-gray2 cursor-pointer transition-colors hover:text-primary"
          @click=";(keywords = recent) & $refs.searchInput.focus()"
        >
          {{ recent }}
        </li>
      </ul>
    </div>

    <div v-show="keywords" class="flex-auto flex flex-col">
      <div
        v-if="!refineMode"
        class="flex mt-2 bg-[#253a77] rounded-sm px-5 py-0.5 items-center"
        @click="$refs.refineInput.focus()"
      >
        <button type="button" class="btn-tertiary" @click.stop="filterHandler">
          <IconFilter />
        </button>
        <input ref="refineInput" type="text" class="_search_input" @keydown.enter="filterHandler" />
      </div>
      <div class="mt-5 flex gap-x-1 items-baseline">
        <p class="mr-auto text-natural-gray2 font-bold">
          <span class="mx-2">{{ total }}</span>
          <span>results</span>
        </p>
        <button v-if="!refineMode" type="button" class="btn-primary" @click="refineMode = true">Refine</button>
        <button v-else type="button" class="btn-primary" @click="clearRefineHandler">Clear</button>
        <button type="button" class="btn-secondary" @click="sortByNewHandler">Newest first</button>
      </div>
      <ul ref="infinityContainer" class="flex-auto h-0 mt-7 w-full space-y-4 overflow-y-auto">
        <li v-for="track in list" :key="track.id" class="bg-tertiary-1 bg-opacity-60 rounded-10 flex gap-x-2 py-3 px-4">
          <div
            class="flex-shrink-0 w-11 h-11 md:w-16 md:h-16 object-cover object-center flex justify-center items-center"
          >
            <img class="w-full object-cover object-center" :src="track.album.coverUrl" :alt="track.album.name" />
          </div>
          <div class="flex-auto min-w-0">
            <BaseMarquee class="text-natural-white">
              <span>{{ track.name }}</span>
            </BaseMarquee>
            <BaseMarquee class="text-natural-white">
              <span v-for="artist in track.artists" :key="artist.name">{{ artist.name }}</span>
            </BaseMarquee>
          </div>
          <div class="flex items-center">
            <button
              class="btn-tertiary"
              type="button"
              @click="$store.dispatch('add', { id: track.id, track_name: track.name })"
            >
              <IconPlus />
            </button>
            <button
              class="btn-tertiary"
              type="button"
              @click="$store.dispatch('jumpIn', { id: track.id, track_name: track.name })"
            >
              <IconArrowUp />
            </button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
<style lang="postcss">
._search_input {
  @apply bg-transparent text-natural-gray1 h-full flex-1 px-2;
  &::placeholder {
    @apply text-natural-gray3;
  }
}
</style>