<script setup lang="ts">
import TrackItem from '@/components/TrackItem.vue'
import { spotifyAPI } from '@/plugins/spotifyAPI'
import { usePreviewAudioStore } from '@/stores'
import { IconWrapper, useInfinityScroll } from 'shared'
import { computed, reactive } from 'vue'
import { useRoute } from 'vue-router'

type ListType = 'playlist' | 'album' | 'artist' | 'long_term' | 'medium_term' | 'short_term'
const route = useRoute()
const uri = route.params.uri as string
const type = route.params.type as ListType

const audioStore = usePreviewAudioStore()

function handleAdd() {}

const data = reactive<{
  items: SpotifyApi.TrackObjectSimplified[]
  paging: Omit<SpotifyApi.PagingObject<any>, 'items'> | null
}>({
  items: [],
  paging: null,
})

async function fetchData(
  type: ListType,
  uri: string,
  option?: { limit?: number; offset?: number }
): Promise<{ items: typeof data.items; paging: typeof data.paging }> {
  switch (type) {
    case 'album':
      return await spotifyAPI.getAlbumTracks(uri, option).then(res => {
        const { items, ...rest } = res
        return { items, paging: rest }
      })
    case 'artist':
      return await spotifyAPI.getArtistTopTracks(uri, 'TW', option).then(res => {
        return { items: res.tracks, paging: null }
      })
    case 'long_term':
    case 'medium_term':
    case 'short_term':
      return await spotifyAPI.getMyTopTracks(type).then(res => {
        const { items, ...rest } = res
        return { items, paging: rest }
      })
    default:
    case 'playlist':
      return await spotifyAPI.getPlaylistTracks(uri, option).then(res => {
        const { items, ...rest } = res
        return { items: items.map(i => i.track as SpotifyApi.TrackObjectFull), paging: rest }
      })
  }
}

fetchData(type, uri).then(r => {
  Object.assign(data, r)
})

const limit = 100
useInfinityScroll({
  containerID: 'tracks_container',
  nextCondition: computed(() => !!data.paging?.next),
  fetchCallback: async () => {
    if (data.paging?.next) {
      const next = await fetchData(type, uri, { offset: data.paging.offset + limit })
      data.items = [...data.items, ...next.items]
      data.paging = next.paging
    }
  },
})
</script>
<template>
  <section class="h-full">
    <ul id="tracks_container" class="h-full flex-1 space-y-5 overflow-auto px-8 pb-16">
      <li v-for="i in data.items" :key="i.uri" class="flex items-center gap-4">
        <TrackItem :data="i as SpotifyApi.TrackObjectFull" class="w-full overflow-hidden" />
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
  </section>
</template>
