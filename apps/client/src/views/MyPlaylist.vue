<script setup lang="ts">
import PlaylistItem from '@/components/PlaylistItem.vue'
import { routeMap } from '@/constant'
import { usePlaylistStore } from '@/stores'
import { analyzeURI } from '@/utils'
import CoverPlaceholder from 'shared/assets/vinyl-record.png'
import { h, type FunctionalComponent } from 'vue'

const playlistStore = usePlaylistStore()
playlistStore.getLists()

const SpecialListItem: FunctionalComponent = (props, { slots }) => {
  return h('li', { class: 'h-full w-full' }, [
    h(
      'div',
      {
        class:
          'border-l-natural-gray2 shadow-natural-white relative overflow-hidden rounded-lg border shadow cursor-pointer aspect-square',
      },
      [
        h('img', { class: 'rounded-[inherit]', src: CoverPlaceholder }),
        h(
          'div',
          { class: 'absolute inset-0 flex flex-col items-center justify-center bg-slate-900/50' },
          slots.default ? slots.default() : undefined
        ),
      ]
    ),
  ])
}
</script>
<template>
  <section>
    <ul class="grid grid-cols-2 gap-4 px-5 pb-10">
      <SpecialListItem @click="$router.push({ name: routeMap.Tracks, params: { type: 'liked' } })">
        <p class="whitespace-break-spaces text-center text-3xl">Liked Tracks</p>
      </SpecialListItem>
      <SpecialListItem @click="$router.push({ name: routeMap.Tracks, params: { type: 'recently' } })">
        <p class="whitespace-break-spaces text-center text-3xl">Recently Played</p>
      </SpecialListItem>
      <SpecialListItem @click="$router.push({ name: routeMap.Tracks, params: { type: 'medium_term' } })">
        <p class="whitespace-break-spaces text-center text-xl">Top Played</p>
        <p class="whitespace-break-spaces text-center text-2xl">Last 6 Months</p>
      </SpecialListItem>
      <SpecialListItem @click="$router.push({ name: routeMap.Tracks, params: { type: 'long_term' } })">
        <p class="whitespace-break-spaces text-center text-xl">Top Played</p>
        <p class="whitespace-break-spaces text-center text-3xl">All Time</p>
      </SpecialListItem>
    </ul>

    <ul class="grid grid-cols-2 gap-4 px-5 pb-10">
      <li v-for="i in playlistStore.lists?.items" :key="i.uri" class="h-full w-full">
        <PlaylistItem
          :name="i.name"
          :images="i.images"
          class="h-full w-full cursor-pointer"
          @click="$router.push({ name: routeMap.Tracks, params: analyzeURI(i.uri) })"
        />
      </li>
    </ul>
  </section>
</template>
