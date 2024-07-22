<script setup lang="ts">
import { IconWrapper, BaseRadio, useInfinityScroll } from 'shared'
import { addQueueSchema, type AddedQueue } from 'server/schemas'
import { computed, ref } from 'vue'
import { usePreviewAudioStore, useSearchStore } from '@/stores'
import TrackItem from '@/components/TrackItem.vue'
import AlbumItem from '@/components/AlbumItem.vue'
import ArtistItem from '@/components/ArtistItem.vue'
import { addQueue, getSpaceSite } from '@/utils'
import { routeMap } from '@/constant'
import { useRouter } from 'vue-router'

const audioStore = usePreviewAudioStore()
const searchStore = useSearchStore()
const innerQuery = ref('')

useInfinityScroll({
  containerID: 'search_result_container',
  nextCondition: computed(() => !!searchStore.currentResult?.paging?.next),
  fetchCallback: searchStore.fetchNext,
})

function handleSearch() {
  searchStore.query = innerQuery.value
  searchStore.search()
}

function handleAdd(track: AddedQueue) {
  const spaceSite = getSpaceSite()
  if (spaceSite) {
    const value = addQueueSchema.parse(track)
    addQueue(spaceSite, value)
  } else {
    console.info('No spaceSite')
  }
}

const router = useRouter()
function handleGoToAlbumTracks(album: SpotifyApi.AlbumObjectFull) {
  searchStore.stageAlbum(album)
  router.push({ name: routeMap.Tracks, params: { uri: album.id, type: 'album' } })
}
function handleGoToArtistTracks(artist: SpotifyApi.ArtistObjectFull) {
  router.push({ name: routeMap.Tracks, params: { uri: artist.id, type: 'artist' } })
}
</script>
<template>
  <section class="flex h-full flex-col gap-3 overflow-hidden">
    <div>
      <div class="mx-auto flex w-fit items-center gap-2">
        <label>關鍵字: </label>
        <input v-model="innerQuery" type="text" class="_input bg-tertiary-1" @keydown.enter="handleSearch" />
        <button type="button" class="flex w-10 items-center justify-center" @click="handleSearch">
          <IconWrapper name="search-line" class="text-2xl" />
        </button>
      </div>
    </div>

    <div class="flex w-full items-center justify-center gap-4 text-sm">
      <BaseRadio name="searchType" v-model="searchStore.type" value="track" label="Track" />
      <BaseRadio name="searchType" v-model="searchStore.type" value="artist" label="Artist(Top 10)" />
      <BaseRadio name="searchType" v-model="searchStore.type" value="album" label="Album" />
    </div>

    <div class="flex flex-1 flex-col overflow-hidden">
      <p class="sticky top-0 mb-3 flex items-baseline gap-3 px-14 text-xl font-bold">
        <span class="capitalize">{{ searchStore.type }}</span
        ><span class="h-px flex-1 bg-slate-400" />
      </p>
      <ul id="search_result_container" class="flex-1 space-y-5 overflow-auto px-8 pb-16">
        <li v-for="i in searchStore.currentResult?.items" :key="i.id" class="flex items-center gap-4">
          <TrackItem
            v-if="searchStore.type === 'track'"
            :data="i as SpotifyApi.TrackObjectFull"
            class="w-full overflow-hidden"
            @play="audioStore.toggle(i as SpotifyApi.TrackObjectFull)"
          />
          <AlbumItem
            v-else-if="searchStore.type === 'album'"
            :data="i as SpotifyApi.AlbumObjectFull"
            class="w-full overflow-hidden"
            @click="handleGoToAlbumTracks(i as SpotifyApi.AlbumObjectFull)"
          />
          <ArtistItem
            v-else-if="searchStore.type === 'artist'"
            :data="i as SpotifyApi.ArtistObjectFull"
            class="w-full overflow-hidden"
            @click="handleGoToArtistTracks(i as SpotifyApi.ArtistObjectFull)"
          />
          <div v-if="i.type === 'track'" class="space-x-1 whitespace-nowrap">
            <button v-if="i.preview_url" type="button" @click="audioStore.toggle(i)">
              <IconWrapper v-if="audioStore.currentPlaying === i.uri" name="stop-large-line" class="text-2xl" />
              <IconWrapper v-else name="play-large-line" class="text-2xl" />
            </button>
            <button type="button" @click="handleAdd(i)">
              <IconWrapper name="add-line" class="text-2xl" />
            </button>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>
