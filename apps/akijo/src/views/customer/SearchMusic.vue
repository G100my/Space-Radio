<script setup lang="ts">
import { IconWrapper, BaseRadio, useInfinityScroll } from 'shared'
import { computed, ref } from 'vue'
import { usePreviewAudioStore, useSearchStore } from '@/stores'
import TrackItem from '@/components/TrackItem.vue'
import AlbumItem from '@/components/AlbumItem.vue'
import ArtistItem from '@/components/ArtistItem.vue'

const audioStore = usePreviewAudioStore()
const searchStore = useSearchStore()
const innerQuery = ref('')

const { isLoading } = useInfinityScroll({
  containerID: 'search_result_container',
  nextCondition: computed(() => !!searchStore.currentResult?.paging?.next),
  fetchCallback: searchStore.fetchNext,
})

function handleSearch() {
  searchStore.query = innerQuery.value
  searchStore.search()
}

function handleAdd() {
  // !
  console.log('!!')
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
      <BaseRadio name="searchType" v-model="searchStore.type" value="artist" label="Artist" />
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
          />
          <AlbumItem
            v-else-if="searchStore.type === 'album'"
            :data="i as SpotifyApi.AlbumObjectFull"
            class="w-full overflow-hidden"
          />
          <ArtistItem
            v-else-if="searchStore.type === 'artist'"
            :data="i as SpotifyApi.ArtistObjectFull"
            class="w-full overflow-hidden"
          />
          <div class="space-x-1 whitespace-nowrap">
            <button v-if="i.type === 'track' && i.preview_url" type="button" @click="audioStore.toggle(i)">
              <IconWrapper v-if="audioStore.currentPlaying === i.uri" name="stop-large-line" class="text-2xl" />
              <IconWrapper v-else name="play-large-line" class="text-2xl" />
            </button>
            <button type="button" @click="handleAdd">
              <IconWrapper name="add-line" class="text-2xl" />
            </button>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>
