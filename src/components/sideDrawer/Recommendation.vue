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
import IconMinusRaw from '@/assets/icons/icon-minus.svg?raw'
import IconPlusRaw from '@/assets/icons/icon-plus.svg?raw'
import IconPlus from '@/assets/icons/icon-plus.svg?component'
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
    IconPlus,
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

    const searchType = ref<SearckType>('track')
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

    const genres = ref<string[]>([])
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
    const genresRecord = JSON.parse(localStorage.getItem('spaceradio_genres') ?? '[]')
    if (genresRecord) {
      const isOverOneDay = Date.now() - Number(genresRecord.timestamp) > 24 * 60 * 60 * 1000
      if (isOverOneDay) fetchGenreSeeds()
      else genres.value = genresRecord.genres
    } else {
      fetchGenreSeeds()
    }

    function addToggle(
      event: MouseEvent,
      type: SearckType,
      key: string /** track id / artist id */,
      name: string /** track name/artist name */
    ) {
      console.log(arguments)
      const element = event.currentTarget as HTMLButtonElement
      if (!element.dataset.added) {
        element.dataset.added = 'true'
        element.innerHTML = IconMinusRaw
        seed[type].push({ key, name })
      } else {
        delete element.dataset.added
        element.innerHTML = IconPlusRaw
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
      seedArtist: computed(() => Array.from(seed.artist)),
      seedTrack: computed(() => Array.from(seed.track)),
    }
  },
}
</script>
<template>
  <div class="flex h-full w-96 flex-col bg-blue-900">
    <header>
      <h2 class="text-subtitle text-natural-gray1 laptop:text-header">{{ $t('add_from_recommendation') }}</h2>
    </header>

    <div class="mt-4 flex-1 flex-col overflow-hidden">
      <div class="flex h-full flex-col overflow-y-hidden text-natural-white">
        <h3 class="mb-4 flex justify-between font-bold">
          <img class="w-20" :src="SpotifyLogo" alt="Spotify logo" />
        </h3>
        <fieldset class="flex items-center space-x-2">
          <input v-model="keyword" class="base-input" type="text" @keydown.enter="handleSearch" />
          <button type="button" class="btn-tertiary" @click="handleSearch"><IconSearch /></button>
        </fieldset>
        <fieldset class="flex gap-4">
          <BaseRadio name="searchType" value="artist" :label="$t('artists')" v-model="searchType" />
          <BaseRadio name="searchType" value="track" :label="$t('tracks')" v-model="searchType" />
        </fieldset>

        <div class="h-20 border border-natural-gray1">
          <p>{{ $t('recommendation.search_seed') }}</p>
          <p v-if="searchType === 'artist'">
            <span v-for="seed in seedArtist" :key="seed.key" class="seed_word">{{ seed.name }}</span>
          </p>
          <p v-else>
            <span v-for="seed in seedTrack" :key="seed.key" class="seed_word">{{ seed.name }}</span>
          </p>
        </div>

        <ul class="h-full overflow-auto">
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
              <button type="button" class="btn-tertiary" @click="addToggle($event, 'artist', artist.id, artist.name)">
                <IconPlus />
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
              <button type="button" class="btn-tertiary" @click="addToggle($event, 'track', track.id, track.name)">
                <IconPlus />
              </button>
            </li>
          </template>
        </ul>
        <div class="pt-8 pb-10">
          <button type="button" class="btn-primary mx-auto" @click="fetchGenreSeeds">Get Recommendations</button>
        </div>
      </div>
    </div>
  </div>
</template>
<style>
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
