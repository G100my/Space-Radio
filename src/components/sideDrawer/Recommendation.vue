<script lang="ts">
import SpotifyLogo from '@/assets/images/Spotify_Logo_CMYK_Green.png'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { reactive, ref, shallowReactive, watch } from 'vue'
import { spotifyAPI } from '@/plugins/spotifyAPI'
import { spotifyCoverPicker } from '@/utility/dataFormat'
import BaseMarquee from '@/components/base/BaseMarquee.vue'
import BaseRadio from '@/components/base/BaseRadio.vue'
import IconSearch from '@/assets/icons/icon-search.svg?component'
import { usePersonalPlaylistStore } from '@/store'

type SearckType = Extract<Parameters<typeof spotifyAPI.search>[1][number], 'track' | 'artist'>
interface SearchSeed {
  key: string
  name: string
}

export default {
  name: 'Recommendation',
  components: {
    BaseMarquee,
    BaseRadio,
    IconSearch,
  },
  emits: ['activeSideDrawer'],
  setup() {
    const { t } = useI18n()
    const autherSeeds = ref([])
    const keyword = ref('')
    const seed = reactive({
      artist: [] as SearchSeed[],
      track: [] as SearchSeed[],
    })

    const results = shallowReactive<{ artists: SpotifyApi.ArtistObjectFull[]; tracks: SpotifyApi.TrackObjectFull[] }>({
      artists: [],
      tracks: [],
    })

    const searchType = ref<SearckType>('artist')
    async function handleSearch() {
      if (!keyword.value) return
      const response = await spotifyAPI.search(keyword.value, [searchType.value])
      switch (searchType.value) {
        case 'artist':
          results.artists = response.artists!.items
          break
        case 'track':
          results.tracks = response.tracks!.items
          break
      }
    }
    function handleDeleteSeed(index: number) {
      if (searchType.value === 'artist') seed.artist.splice(index, 1)
      else seed.track.splice(index, 1)
    }

    const genres = ref<string[]>([])
    function fetchGenreSeeds() {
      return spotifyAPI.getAvailableGenreSeeds().then(response => {
        if (!response) {
          console.error('getAvailableGenreSeeds error')
          return
        }
        localStorage.setItem('spaceradio_genres', JSON.stringify({ genres: response.genres, timestamp: Date.now() }))
        console.log(response)
        genres.value = response.genres
      })
    }
    const genresRecord = JSON.parse(localStorage.getItem('spaceradio_genres') ?? '[]')
    if (genresRecord) {
      const isOverOneDay = Date.now() - Number(genresRecord.timestamp) > 24 * 60 * 60 * 1000
      if (isOverOneDay) fetchGenreSeeds()
      else genres.value = genresRecord.genres
    } else {
      fetchGenreSeeds()
    }

    function addToggle(
      type: SearckType,
      key: string /** track id / artist id */,
      name: string /** track name/artist name */
    ) {
      if (seed[type].findIndex(i => i.key === key) === -1) {
        seed[type].push({ key, name })
      } else {
        const targetIndex = seed[type].findIndex(i => i.key === key)
        if (targetIndex !== -1) {
          seed[type].splice(targetIndex, 1)
        }
      }
    }
    watch(seed, newOne => {
      console.log(newOne)
    })

    return {
      SpotifyLogo,
      spotify: computed(() => usePersonalPlaylistStore().spotifyPlaylists),
      t,
      autherSeeds,
      keyword: keyword,
      results,
      spotifyCoverPicker,
      addToggle,
      fetchGenreSeeds,
      handleSearch,
      searchType,
      seedList: computed(() => (searchType.value === 'artist' ? Array.from(seed.artist) : Array.from(seed.track))),
      handleDeleteSeed,
    }
  },
}
</script>
<template>
  <div class="flex h-full flex-col">
    <header>
      <h2 class="flex items-center justify-between text-subtitle text-natural-gray1 laptop:text-header">
        <span>{{ $t('add_from_recommendation') }}</span>
        <img class="w-20" :src="SpotifyLogo" alt="Spotify logo" />
      </h2>
    </header>

    <div class="mt-4 flex-1 flex-col overflow-hidden">
      <div class="flex h-full flex-col gap-4 overflow-y-hidden text-natural-white">
        <fieldset class="flex w-full flex-wrap items-center gap-2">
          <input v-model="keyword" class="base-input flex-1" type="text" @keydown.enter="handleSearch" />
          <button type="button" class="btn-tertiary" @click="handleSearch"><IconSearch /></button>
          <div class="flex gap-4">
            <BaseRadio name="searchType" value="artist" :label="$t('artists')" v-model="searchType" />
            <BaseRadio name="searchType" value="track" :label="$t('tracks')" v-model="searchType" />
          </div>
        </fieldset>

        <fieldset class="min-h-fit h-40 border border-natural-gray1 p-2">
          <legend class="ml-1">{{ $t('recommendation.search_seed') }}</legend>
          <p>
            <button
              v-for="(seed, index) in seedList"
              :key="seed.key"
              class="seed_word group"
              @click="handleDeleteSeed(index)"
            >
              <span>{{ seed.name }}</span>
              <span class="absolute inset-0 bg-natural-black/80 opacity-0 transition-opacity group-hover:opacity-100">
                <i class="ri-delete-bin-line"></i>
              </span>
            </button>
          </p>
        </fieldset>
        <div>
          <button type="button" class="btn-primary mx-auto" @click="fetchGenreSeeds">Get Recommendations</button>
        </div>

        <ul class="laptop:columns-2 h-full overflow-auto">
          <template v-if="searchType === 'artist'">
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
                class="btn-tertiary group text-xl"
                @click="addToggle('artist', artist.id, artist.name)"
              >
                <i v-if="seedList.findIndex(i => artist.id === i.key) === -1" class="ri-add-line" />
                <i v-else class="ri-subtract-fill" />
              </button>
            </li>
          </template>
          <template v-if="searchType === 'track'">
            <li v-for="track in results.tracks" :key="track.id" class="flex items-center space-x-3 py-1 px-4">
              <img class="_cover" :src="spotifyCoverPicker(track.album.images)" alt="" />
              <div class="w-0 flex-1">
                <BaseMarquee>{{ track.name }}</BaseMarquee>
                <BaseMarquee>
                  <span class="w-full space-x-2 text-xs">
                    <span v-for="artist in track.artists" :key="artist.name" class="capitalize">{{ artist.name }}</span>
                  </span>
                </BaseMarquee>
              </div>
              <button
                type="button"
                class="btn-tertiary group text-xl"
                @click="addToggle('track', track.id, track.name)"
              >
                <i v-if="seedList.findIndex(i => track.id === i.key) === -1" class="ri-add-line" />
                <i v-else class="ri-subtract-fill" />
              </button>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </div>
</template>
<style>
.seed_word {
  @apply relative overflow-hidden rounded-full;
}
.seed_word::before {
  content: '"';
}
.seed_word::after {
  content: '"';
}
.seed_word:not(:last-child)::after {
  content: '", ';
}
</style>
