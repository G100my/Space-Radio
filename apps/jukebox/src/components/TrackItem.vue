<script setup lang="ts">
import type { TrackBaseInfo } from '@/constant'
import type { AddedQueue } from 'shared/schemas'
import { Marquee, spotifyCoverPicker } from 'shared'

defineProps<{
  data: TrackBaseInfo | AddedQueue
}>()

defineEmits<{
  (e: 'play'): void
}>()

function handleOpenLink(event: MouseEvent | TouchEvent) {
  const target = event.currentTarget as HTMLSpanElement
  window.open(target.getAttribute('data-href')!, '_blank')
}
</script>
<template>
  <div class="flex items-center gap-3">
    <img
      class="_cover"
      :src="spotifyCoverPicker(data.album?.images)"
      :alt="data.name"
      @click="data.preview_url && $emit('play')"
    />
    <div class="flex-1 cursor-pointer overflow-hidden">
      <Marquee class="text-white">
        <span>{{ data.name }}</span>
      </Marquee>
      <Marquee class="text-white">
        <span
          v-for="artist in data.artists"
          :key="artist.name"
          :data-href="artist.external_urls.spotify"
          @click.stop
          @dblclick="handleOpenLink"
          >{{ artist.name }}</span
        >
        -
        <span :data-href="data.album?.external_urls.spotify" target="_blank" @click.stop @dblclick="handleOpenLink">{{
          data.album?.name
        }}</span>
      </Marquee>
    </div>
  </div>
</template>
