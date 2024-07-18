<script setup lang="ts">
import { spotifyCoverPicker } from 'shared'
import CoverPlaceholder from 'shared/assets/vinyl-record.png'

withDefaults(
  defineProps<{
    name: string
    images?: SpotifyApi.PlaylistBaseObject['images']
  }>(),
  { images: () => [] }
)
</script>
<template>
  <div class="border-l-natural-gray2 shadow-natural-white flex flex-col rounded-lg border shadow">
    <div class="min-h-[calc(50vw-28px)] overflow-hidden rounded-[inherit]">
      <img :src="spotifyCoverPicker(images) ?? CoverPlaceholder" :alt="name" class="w-full" />
    </div>
    <div class="flex flex-1 items-center justify-center">
      <p class="text-center">{{ name }}</p>
    </div>
  </div>
</template>
