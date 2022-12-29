<script lang="ts" setup>
import SpotifyLogo from '@/assets/images/Spotify_Logo_CMYK_Green.png'
import { reactive, ref, shallowReactive, onMounted } from 'vue'
import { spotifyAPI } from '@/plugins/spotifyAPI'
import { spotifyCoverPicker } from '@/utility/dataFormat'
import BaseMarquee from '@/components/base/BaseMarquee.vue'
import BaseRadio from '@/components/base/BaseRadio.vue'
import IconSearch from '@/assets/icons/icon-search.svg?component'
import BaseDetails from '@/components/base/BaseDetails.vue'

type SearchType = Extract<Parameters<typeof spotifyAPI.search>[1][number], 'track' | 'artist'>
type SeedType = 'seed_artists' | 'seed_genres' | 'seed_tracks'
interface SearchSeed {
  key: string
  name: string
  type: SeedType
}
type Params = Omit<SpotifyApi.RecommendationsOptionsObject, SeedType>

const keyword = ref('')
const results = shallowReactive<{ artists: SpotifyApi.ArtistObjectFull[]; tracks: SpotifyApi.TrackObjectFull[] }>({
  artists: [],
  tracks: [],
})

const searchType = ref<SearchType>('artist')
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

const seeds = reactive<SearchSeed[]>([])
const findSeedIndex = (key: string, type: SeedType): number => seeds.findIndex(i => i.key === key && i.type === type)
const seedLimit = 5
function toggleSeed(
  key: string /** track id / artist id */,
  name: string /** track name/artist name */,
  type: SeedType
) {
  const seedIndex = findSeedIndex(key, type)
  if (seeds.length < seedLimit && seedIndex === -1) {
    seeds.push({ key, name, type })
  } else if (seedIndex !== -1) {
    seeds.splice(seedIndex, 1)
  }
}
const genres = ref<string[]>([])
onMounted(() => {
  spotifyAPI.getAvailableGenreSeeds().then(response => {
    if (!response) {
      console.error('getAvailableGenreSeeds error')
      return
    }
    genres.value = response.genres
  })
})

const formValue = reactive<Params>({
  max_acousticness: undefined,
  max_danceability: undefined,
  max_energy: undefined,
  max_instrumentalness: undefined,
  max_liveness: undefined,
  max_loudness: undefined,
  max_mode: undefined,
  max_popularity: undefined,
  max_speechiness: undefined,
  max_tempo: undefined,
  max_valence: undefined,
  min_acousticness: undefined,
  min_danceability: undefined,
  min_energy: undefined,
  min_instrumentalness: undefined,
  min_liveness: undefined,
  min_loudness: undefined,
  min_mode: undefined,
  min_popularity: undefined,
  min_speechiness: undefined,
  min_tempo: undefined,
  min_valence: undefined,
  target_acousticness: undefined,
  target_danceability: undefined,
  target_energy: undefined,
  target_instrumentalness: undefined,
  target_liveness: undefined,
  target_loudness: undefined,
  target_mode: undefined,
  target_popularity: undefined,
  target_speechiness: undefined,
  target_tempo: undefined,
  target_valence: undefined,
})
function getRecommendation() {
  const formatted = seeds.reduce<Record<SeedType, string[]>>(
    (acc, i) => {
      acc[i.type].push(i.key)
      return acc
    },
    { seed_artists: [], seed_genres: [], seed_tracks: [] }
  )
  const params = Object.assign({}, formValue)
  Object.keys(params).forEach(i => {
    if (!params[i as keyof typeof params]) delete params[i as keyof typeof params]
  })
  spotifyAPI.getRecommendations({ ...params, ...formatted }).then(res => console.log(res))
}
</script>
<template>
  <div class="flex h-full flex-col text-natural-white">
    <header>
      <h2 class="flex items-center justify-between text-subtitle text-natural-gray1 laptop:text-header">
        <span>{{ $t('add_from_recommendation') }}</span>
        <img class="w-20" :src="SpotifyLogo" alt="Spotify logo" />
      </h2>
    </header>

    <div class="mt-4 flex-1 flex-col overflow-hidden">
      <div class="flex flex-col overflow-y-hidden">
        <fieldset class="flex max-h-full w-full flex-wrap items-center gap-2">
          <input v-model="keyword" class="base-input flex-1" type="text" @keydown.enter="handleSearch" />
          <button type="button" class="btn-tertiary" @click="handleSearch"><IconSearch /></button>
          <div class="flex gap-4">
            <BaseRadio name="searchType" value="artist" :label="$t('recommendation.by_artist')" v-model="searchType" />
            <BaseRadio name="searchType" value="track" :label="$t('recommendation.by_track')" v-model="searchType" />
          </div>
        </fieldset>
        <fieldset class="my-1 overflow-hidden rounded">
          <BaseDetails :summaryText="$t('recommendation.genre')">
            <div class="overflow-auto">
              <ul class="columns-2 laptop:columns-3">
                <li v-for="genre in genres" :key="genre">
                  <button
                    :class="{ 'bg-neutral-100/30': findSeedIndex(genre, 'seed_genres') !== -1 }"
                    class="hover:bg-neutral-100/30"
                    @click="toggleSeed(genre, genre, 'seed_genres')"
                  >
                    {{ genre }}
                  </button>
                </li>
              </ul>
            </div>
          </BaseDetails>
        </fieldset>

        <fieldset class="relative h-fit min-h-[65px] border border-natural-gray1 p-2">
          <legend class="ml-1">{{ $t('recommendation.search_seed') }}</legend>
          <p>
            <button
              v-for="(seed, index) in seeds"
              :key="typeof seed === 'string' ? seed : seed.key"
              class="seed_word group"
              @click="seeds.splice(index, 1)"
            >
              <span>{{ typeof seed === 'string' ? seed : seed.name }}</span>
              <span class="absolute inset-0 bg-natural-black/80 opacity-0 transition-opacity group-hover:opacity-100">
                <i class="ri-delete-bin-line"></i>
              </span>
            </button>
          </p>
          <button v-show="seeds.length" class="btn absolute top-0 right-0 bottom-0 my-auto" @click="seeds.length = 0">
            <i class="ri-delete-bin-line text-2xl" />
          </button>
        </fieldset>
        <div>
          <button type="button" class="btn-primary mx-auto" @click="getRecommendation">Get Recommendations</button>
        </div>
      </div>

      <ul class="h-full overflow-auto laptop:columns-2">
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
              @click="toggleSeed(artist.id, artist.name, 'seed_artists')"
            >
              <i v-if="findSeedIndex(artist.id, 'seed_artists') === -1" class="ri-add-line" />
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
              @click="toggleSeed(track.id, track.name, 'seed_tracks')"
            >
              <i v-if="findSeedIndex(track.id, 'seed_tracks') === -1" class="ri-add-line" />
              <i v-else class="ri-subtract-fill" />
            </button>
          </li>
        </template>
      </ul>
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
