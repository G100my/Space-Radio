<script setup lang="ts">
import { spotifyCoverPicker, Marquee } from 'shared'

defineProps<{
  data: SpotifyApi.AlbumObjectFull
}>()
</script>
<template>
  <div class="flex gap-3">
    <img class="_cover" :src="spotifyCoverPicker(data.images)" :alt="data.name" />
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
      </Marquee>
    </div>
  </div>
</template>
