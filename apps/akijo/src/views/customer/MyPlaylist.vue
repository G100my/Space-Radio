<script setup lang="ts">
import PlaylistItem from '@/components/PlaylistItem.vue'
import { routeMap } from '@/router'
import usePlaylistStore from '@/stores/usePlaylistStore'
import { analyzeURI } from '@/utils'

const playlistStore = usePlaylistStore()
playlistStore.getLists()
</script>
<template>
  <section>
    <ul class="grid grid-cols-2 gap-4 px-5 pb-10">
      <li v-for="i in playlistStore.lists?.items" :key="i.uri" class="h-full w-full">
        <PlaylistItem
          :data="i"
          class="h-full w-full"
          @click="$router.push({ name: routeMap.C_tracks, params: analyzeURI(i.uri) })"
        />
      </li>
    </ul>
  </section>
</template>
