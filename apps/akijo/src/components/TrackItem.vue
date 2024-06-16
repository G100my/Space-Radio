<script setup lang="ts">
import type { TrackBaseInfo } from '@/constant'
import { Marquee, spotifyCoverPicker } from 'shared'

defineProps<{
  data: TrackBaseInfo
}>()
</script>
<template>
  <div class="flex gap-3">
    <img class="_cover" :src="spotifyCoverPicker(data.album.images)" :alt="data.name" />
    <div class="flex-1 overflow-hidden">
      <Marquee class="text-white">
        <span>{{ data.name }}</span>
      </Marquee>
      <Marquee class="text-white">
        <a
          v-for="artist in data.artists"
          :key="artist.name"
          :href="artist.external_urls.spotify"
          target="_blank"
          @click.stop
          >{{ artist.name }}</a
        >
        - <a :href="data.album.external_urls.spotify" target="_blank" @click.stop>{{ data.album.name }}</a>
      </Marquee>
    </div>
  </div>
</template>
