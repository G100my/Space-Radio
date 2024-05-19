<script setup lang="ts">
import IconPlus from '@/assets/icons/icon-plus.svg?component'
import IconArrowUp from '@/assets/icons/icon-arrow-up.svg?component'
import BaseMarquee from '../base/BaseMarquee.vue'
import type { FormattedTrack } from '@/utility/dataFormat'
import { useQueueStore } from '@/store'

withDefaults(
  defineProps<{
    list: FormattedTrack[]
    selectable?: boolean
    selectMode?: boolean
    selectHandler?: (value: string, id: string, name: string) => void
  }>(),
  { selectHandler: () => {} }
)

const store = useQueueStore()
</script>
<template>
  <ul class="space-y-4 overflow-y-auto">
    <li v-for="track in list" :key="track.id" class="flex gap-x-2 rounded-10 bg-tertiary-1 bg-opacity-60 py-3 px-4">
      <div class="flex h-11 w-11 flex-shrink-0 items-center justify-center md:h-16 md:w-16">
        <img v-show="!selectMode" class="_cover" :src="track.coverUrl" :alt="track.albumName" />
        <input
          v-if="selectable"
          v-show="selectMode"
          type="checkbox"
          @change="selectHandler(($event.target as HTMLInputElement).value, track.id, track.name)"
        />
      </div>
      <!-- https://www.w3.org/TR/css-flexbox-1/#min-size-auto -->
      <div class="min-w-0 flex-auto">
        <BaseMarquee class="text-natural-white">
          <span>{{ track.name }}</span>
        </BaseMarquee>
        <BaseMarquee class="text-natural-white">
          <span v-for="artist in track.artists" :key="artist.name">{{ artist.name }}</span>
        </BaseMarquee>
      </div>
      <div class="flex items-center">
        <button class="btn-tertiary" type="button" @click="store.add(track.id, track.name)">
          <IconPlus />
        </button>
        <button class="btn-tertiary" type="button" @click="store.jumpIn(track.id, track.name)">
          <IconArrowUp />
        </button>
      </div>
    </li>
  </ul>
</template>
