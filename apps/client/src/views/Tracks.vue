<script setup lang="ts">
import TrackItem from '@/components/TrackItem.vue'
import { usePlaylistStore, usePreviewAudioStore } from '@/stores'
import type { ListType } from '@/stores'
import { addQueue, getSpaceSite } from '@/utils'
import type { AddedQueue } from 'server/schemas'
import { IconWrapper, useInfinityScroll } from 'shared'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const uri = route.params.uri as string
const type = route.params.type as ListType

const audioStore = usePreviewAudioStore()
const playlistStore = usePlaylistStore()

function handleAdd(track: AddedQueue) {
  const spaceSite = getSpaceSite()
  if (spaceSite) {
    addQueue(spaceSite, track)
  } else {
    console.info('No spaceSite')
  }
}

// playlistStore.type = undefined
playlistStore.fetchTracks({ type, uri })

useInfinityScroll({
  containerID: 'tracks_container',
  nextCondition: computed(() => !!playlistStore.paging?.next),
  fetchCallback: async () => {
    if (playlistStore.paging?.next) {
      await playlistStore.fetchTracks({ type, uri, next: true })
    }
  },
})
</script>
<template>
  <section class="-mt-12 h-full">
    <ul id="tracks_container" class="h-full flex-1 space-y-5 overflow-auto px-8 pb-16">
      <li v-for="(i, key) in playlistStore.items" :key="i.uri + key" class="flex items-center gap-4">
        <TrackItem :data="i" class="w-full overflow-hidden" />
        <div class="space-x-1 whitespace-nowrap">
          <button v-if="i.type === 'track' && i.preview_url" type="button" @click="audioStore.toggle(i)">
            <IconWrapper v-if="audioStore.currentPlaying === i.uri" name="stop-large-line" class="text-2xl" />
            <IconWrapper v-else name="play-large-line" class="text-2xl" />
          </button>
          <button type="button" @click="handleAdd(i)">
            <IconWrapper name="add-line" class="text-2xl" />
          </button>
        </div>
      </li>
    </ul>
  </section>
</template>
