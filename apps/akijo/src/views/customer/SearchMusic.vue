<script setup lang="ts">
import { IconWrapper, BaseRadio } from 'shared'
import { ref } from 'vue'
import { useSearchStore } from '@/stores'
import TrackItem from '@/components/TrackItem.vue'
import AlbumItem from '@/components/AlbumItem.vue'
import ArtistItem from '@/components/ArtistItem.vue'

const searchStore = useSearchStore()
const keyword = ref('')

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
        <input
          v-model="keyword"
          type="text"
          class="_input bg-tertiary-1"
          @keydown.enter="searchStore.search(keyword)"
        />
        <button type="button" class="flex w-10 items-center justify-center" @click="searchStore.search(keyword)">
          <IconWrapper name="search-line" class="text-2xl" />
        </button>
      </div>
    </div>

    <div class="flex w-full items-center justify-center gap-4">
      <BaseRadio name="searchType" v-model="searchStore.type" value="track" label="Track" />
      <BaseRadio name="searchType" v-model="searchStore.type" value="artist" label="Artist" />
      <BaseRadio name="searchType" v-model="searchStore.type" value="album" label="Album" />
    </div>

    <div class="flex-1 overflow-auto px-14">
      <p class="mb-3 flex items-baseline gap-3 text-xl font-bold">
        <span class="capitalize">{{ searchStore.type }}</span
        ><span class="h-px flex-1 bg-slate-400" />
      </p>
      <div v-if="searchStore.listBySearchType">
        <ul class="space-y-5">
          <li v-for="i in searchStore.listBySearchType" :key="i.id" class="relative" @click="handleAdd">
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
            <button type="button" class="absolute inset-y-0 -right-6" @click="handleAdd">
              <IconWrapper name="add-line" class="text-2xl" />
            </button>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
