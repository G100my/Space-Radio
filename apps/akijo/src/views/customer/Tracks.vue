<script setup lang="ts">
import TrackItem from '@/components/TrackItem.vue'
import { useTrackStore, usePreviewAudioStore } from '@/stores'
import type { ListType } from '@/stores'
import { IconWrapper, useInfinityScroll } from 'shared'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const uri = route.params.uri as string
const type = route.params.type as ListType

const audioStore = usePreviewAudioStore()
const trackStore = useTrackStore()

function handleAdd() {}

trackStore.type = undefined
trackStore.fetchTracks({ type, uri })

useInfinityScroll({
  containerID: 'tracks_container',
  nextCondition: computed(() => !!trackStore.paging?.next),
  fetchCallback: async () => {
    if (trackStore.paging?.next) {
      await trackStore.fetchTracks({ type, uri, next: true })
    }
  },
})
</script>
<template>
  <section class="h-full">
    <ul id="tracks_container" class="h-full flex-1 space-y-5 overflow-auto px-8 pb-16">
      <li v-for="(i, key) in trackStore.items" :key="i.uri + key" class="flex items-center gap-4">
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
