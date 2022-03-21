<script>
import SpotifyLogo from '@/assets/images/Spotify_Logo_CMYK_Green.png'
import { computed } from '@vue/runtime-core'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { reactive, ref, shallowReactive, watch } from 'vue'
import { spotifyAPI } from '@/utility/spotifyAPI'
import { spotifyCoverPicker } from '@/utility/dataFormat'
import fakedata from '@/fakeData/search.json'
import BaseMarquee from '../base/BaseMarquee.vue'
import IconSearch from '@/assets/icons/icon-search.svg'
import IconMinusRaw from '@/assets/icons/icon-minus.svg?raw'
import IconPlusRaw from '@/assets/icons/icon-plus.svg?raw'
import IconPlus from '@/assets/icons/icon-plus.svg'
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/vue'

export default {
  name: 'Recommendation',
  components: { BaseMarquee, IconSearch, IconPlus, TabGroup, TabList, TabPanel, TabPanels, Tab },
  emits: ['activeSideDrawer'],
  setup() {
    const store = useStore()
    const { t } = useI18n()
    const autherSeeds = ref([])
    const keywordArtist = ref('')
    const seed = reactive({
      artists: new Map(),
      tracks: new Map(),
    })

    const results = shallowReactive({
      artists:
        fakedata.artists.map(i => {
          console.log(i)
          return i
        }) ?? [],
      tracks: fakedata.tracks ?? [],
    })
    async function handleSearch(type) {
      const response = await spotifyAPI.search(keywordArtist.value, [type])
      console.log(response)
      switch (type) {
        case 'artist':
          results.artists = response.artists?.items ?? []
          break
        case 'track':
          results.tracks = response.tracks?.items ?? []
          break
      }
    }
    const handleSearchArtist = () => handleSearch('artist')
    const handleSearchTrack = () => handleSearch('track')

    function fetchGenreSeeds() {
      return spotifyAPI.getAvailableGenreSeeds().then(response => {
        if (!response) {
          console.error('getAvailableGenreSeeds error')
          return
        }
        localStorage.setItem('spaceradio_genres', JSON.stringify({ genres: response.genres, timestamp: Date.now() }))
        genres.value = response.genres
      })
    }
    const genres = ref([])
    const genresRecord = JSON.parse(localStorage.getItem('spaceradio_genres'))
    if (genresRecord) {
      const isOverOneDay = Date.now() - Number(genresRecord.timestamp) > 24 * 60 * 60 * 1000
      if (isOverOneDay) fetchGenreSeeds()
      else genres.value = genresRecord.genres
    } else {
      fetchGenreSeeds()
    }

    function addToggle(event, type, key, value) {
      console.log(arguments)
      const target = event.currentTarget
      if (!target.dataset.added) {
        target.dataset.added = true
        target.innerHTML = IconMinusRaw
        seed[type].set(key, value)
      } else {
        delete target.dataset.added
        target.innerHTML = IconPlusRaw
        seed[type].delete(key, value)
      }
    }
    watch(seed, newOne => {
      console.log(newOne)
    })

    return {
      SpotifyLogo,
      spotify: computed(() => store.getters.spotifyLists),
      t,
      autherSeeds,
      keyword: keywordArtist,
      handleSearchArtist,
      handleSearchTrack,
      results,
      spotifyCoverPicker,
      addToggle,
    }
  },
}
</script>
<template>
  <div class="flex h-full flex-col text-green-200">
    <header>
      <h2 class="text-subtitle text-natural-gray1 laptop:text-header">{{ t('add_from_recommendation') }}</h2>
    </header>

    <div class="mt-4 flex-1 flex-col overflow-hidden">
      <div class="flex h-full flex-col overflow-y-hidden">
        <h3 class="mb-4 flex justify-between font-bold">
          <!-- <p class="text-natural-white">{{ t('your_library') }}</p> -->
          <img class="w-20" :src="SpotifyLogo" alt="Spotify logo" />
        </h3>
        <form class="flex flex-col space-y-2 bg-red-400">
          <div class="flex items-center space-x-2">
            <label for="search_artist">Artist</label>
            <input
              id="search_artist"
              v-model="keyword"
              class="base-input"
              type="text"
              @keydown.enter="handleSearchArtist"
            />
            <button type="button" class="btn-tertiary" @click="handleSearchArtist"><IconSearch /></button>
          </div>
          <div class="flex items-center space-x-2">
            <label for="search_track">Track</label>
            <input
              id="search_track"
              v-model="keyword"
              class="base-input"
              type="text"
              @keydown.enter="handleSearchTrack"
            />
            <button type="button" class="btn-tertiary" @click="handleSearchTrack"><IconSearch /></button>
          </div>
        </form>
        <!--  -->
        <TabGroup as="div" class="h-0 flex-1 overflow-auto">
          <TabList class="mx-auto flex w-2/3 justify-center space-x-1">
            <Tab v-for="resultType in ['tracks', 'artists']" :key="resultType" v-slot="{ selected }" as="template">
              <button class="btn-secondary" :class="{ 'bg-tertiary-1': selected }">
                {{ resultType }}
              </button>
            </Tab>
          </TabList>

          <TabPanels class="mt-2">
            <TabPanel>
              <ul class="h-full overflow-auto">
                <li v-for="artist in results.artists" :key="artist.id" class="flex items-center space-x-3 py-1 px-4">
                  <img class="_cover" :src="spotifyCoverPicker(artist.images)" alt="" />
                  <div class="w-0 flex-1">
                    <div>
                      <BaseMarquee>{{ artist.name }}</BaseMarquee>
                      <p class="text-xs">Popularity: {{ artist.popularity }}%</p>
                    </div>
                    <BaseMarquee>
                      <span class="w-full space-x-2 text-xs">
                        <span v-for="genre in artist.genres" :key="genre" class="capitalize">{{ genre }},</span>
                      </span>
                    </BaseMarquee>
                  </div>
                  <button
                    type="button"
                    class="btn-tertiary"
                    @click="addToggle($event, 'artists', artist.id, artist.name)"
                  >
                    <IconPlus />
                  </button>
                </li>
              </ul>
            </TabPanel>
            <TabPanel>
              <ul class="h-full overflow-auto">
                <li v-for="track in results.tracks" :key="track.id" class="flex items-center space-x-3 py-1 px-4">
                  <img class="_cover" :src="spotifyCoverPicker(track.album.images)" alt="" />
                  <div class="w-0 flex-1">
                    <BaseMarquee>{{ track.name }}</BaseMarquee>
                    <BaseMarquee>
                      <span class="w-full space-x-2 text-xs">
                        <span v-for="artist in track.artists" :key="artist.name" class="capitalize">{{
                          artist.name
                        }}</span>
                      </span>
                    </BaseMarquee>
                  </div>
                  <button type="button" class="btn-tertiary" @click="addToggle($event, 'tracks', track.id, track.name)">
                    <IconPlus />
                  </button>
                </li>
              </ul>
            </TabPanel>
          </TabPanels>
        </TabGroup>
        <div class="pt-8 pb-10">
          <button type="button" class="btn-primary mx-auto" @click="fetchGenreSeeds">Get Recommendations</button>
        </div>
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
<style lang="postcss">
._overwrite + ._slide_navigation._container {
  @apply mt-5 h-fit bg-transparent;
  & > ._slide_navigation_bar {
    top: auto;
    bottom: 0;
  }
}
</style>
