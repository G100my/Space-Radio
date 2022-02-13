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
  <div class="flex min-h-full flex-col">
    <header class="flex items-center rounded-sm bg-[#253a77] px-5 py-2" @click="$refs.searchInput.focus()">
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
      <p class="my-5 text-subtitle text-natural-gray2">Recent searches</p>

      <ul class="mt-7 h-0 flex-auto overflow-y-auto px-10">
        <li
          v-for="recent in recentSearchStrings"
          :key="recent"
          class="cursor-pointer py-3 text-natural-gray2 transition-colors hover:text-primary"
          @click=";(keywords = recent) & $refs.searchInput.focus()"
        >
          {{ recent }}
        </li>
      </ul>
    </div>

    <div v-show="keywords" class="flex flex-auto flex-col">
      <div class="mt-5 flex items-baseline gap-x-1">
        <p class="mr-auto font-bold text-natural-gray2">
          <span class="mx-2">{{ list.length }} / {{ searchedAmount }}</span>
          <span>results</span>
          <IconSpinnerLoader v-show="loadingAnimation" class="mx-2 inline-block animate-spin text-natural-gray2" />
        </p>
      </div>

      <InfinityContainer :list="list" class="mt-7 h-0 w-full flex-auto" />
    </div>
  </div>
</template>
<style lang="postcss">
._search_input {
  @apply h-full flex-1 bg-transparent px-2 text-natural-gray1;
  &::placeholder {
    @apply text-natural-gray3;
  }
}
</style>
