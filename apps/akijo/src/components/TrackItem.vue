<script setup lang="ts">
import { Marquee, spotifyCoverPicker } from 'shared'

defineProps<{
  data: SpotifyApi.TrackObjectFull
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
        <span>
          <span v-for="artist in data.artists" :key="artist.name">{{ artist.name }}</span> - {{ data.album.name }}
        </span>
      </Marquee>
    </div>
  </div>
</template>
