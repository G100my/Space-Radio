<script>
import IconSearch from '@/assets/icons/icon-search.svg'
import IconSpinnerLoader from '@/assets/icons/icon-spinner-loader.svg'
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { spotifyAPI } from '@/utility/spotifyAPI'
import { spotifyCoverPicker } from '@/utility/dataFormat'
import InfinityContainer from './InfinityContainer.vue'

export default {
  components: {
    IconSearch,
    IconSpinnerLoader,
    InfinityContainer,
  },
  setup() {
    let observer
    let infinityContainer
    onMounted(() => {
      infinityContainer = document.getElementById('infinity')
      const observerOptions = {
        root: infinityContainer,
        rootMargin: '0px',
        threshold: 0.5,
      }
      const callback = ([entry]) => {
        if (entry.isIntersecting) search(previousOffset + limit)
      }
      observer = new IntersectionObserver(callback, observerOptions)
    })

    const list = ref([])
    const keywords = ref('')
    const searchedAmount = ref(0)
    let previousOffset = 0
    let target
    let next
    const limit = 30
    const loadingAnimation = ref(false)
    function search(offset = 0) {
      loadingAnimation.value = true
      spotifyAPI.search(keywords.value, ['track'], { limit, offset }).then(response => {
        response.tracks.items.forEach(i => (i.album.coverUrl = spotifyCoverPicker(i.album.images)))

        list.value = list.value.concat(response.tracks.items)
        next = response.tracks.next
        searchedAmount.value = response.tracks.total
        previousOffset = response.tracks.offset

        loadingAnimation.value = false

        if (target) observer.unobserve(target)
        if (next || searchedAmount.value > list.value.length) {
          nextTick(() => {
            target = infinityContainer.lastElementChild
            observer.observe(target)
          })
        }
      })
    }

    const recentSearchStrings = JSON.parse(localStorage.getItem('spaceradio_recent_search')) || []
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
      loadingAnimation,
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

      <ul class="flex-auto h-0 mt-7 overflow-y-auto px-10">
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
      <div class="mt-5 flex gap-x-1 items-baseline">
        <p class="mr-auto text-natural-gray2 font-bold">
          <span class="mx-2">{{ list.length }} / {{ searchedAmount }}</span>
          <span>results</span>
          <IconSpinnerLoader v-show="loadingAnimation" class="animate-spin inline-block text-natural-gray2 mx-2" />
        </p>
      </div>

      <InfinityContainer :list="list" class="flex-auto h-0 mt-7 w-full" />
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
