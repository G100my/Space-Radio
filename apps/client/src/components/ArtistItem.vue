<script setup lang="ts">
import { spotifyCoverPicker, Marquee } from 'shared'

defineProps<{
  data: SpotifyApi.ArtistObjectFull
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
        <a v-for="(genre, index) in data.genres" :key="genre" class="text-xs capitalize" @click.stop
          >{{ genre }}{{ index === data.genres.length - 1 ? '' : ',' }}</a
        >
      </Marquee>
    </div>
  </div>
</template>
