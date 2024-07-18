<script setup lang="ts">
import TrackItem from '@/components/TrackItem.vue'
import { IconWrapper, usePersonalStore } from 'shared'
import { useHostStore, usePreviewAudioStore } from '@/stores'
import { hostApi } from '@/api/cloudFunctionAPI'

const audioStore = usePreviewAudioStore()
const personalStore = usePersonalStore()
const hostStore = useHostStore()

function handleResolve(params: { key: string; action: 'approve' | 'reject' }) {
  const space = personalStore.id
  if (!space) {
    console.error('No space')
    return
  }
  hostApi.resolveQueue({ ...params, space })
}
</script>
<template>
  <section class="flex-1 overflow-auto">
    <ul v-if="hostStore.queueAmount" class="w-full space-y-3">
      <li v-for="(i, key) in hostStore.queue" :key="key" class="flex items-center gap-3">
        <div class="flex w-0 flex-1 items-center gap-2">
          <p class="text-2xl">{{ i.site ?? '??' }}</p>
          <TrackItem :data="i" class="flex-1 overflow-hidden" @play="audioStore.toggle(i)" />
        </div>
        <button
          type="button"
          class="aspect-square h-10 w-10 flex-shrink-0 rounded border-2"
          @click="handleResolve({ key: key as string, action: 'approve' })"
        >
          <IconWrapper name="check-line" />
        </button>
        <button
          type="button"
          class="aspect-square h-10 w-10 flex-shrink-0 rounded border-2"
          @click="handleResolve({ key: key as string, action: 'reject' })"
        >
          <IconWrapper name="close-line" />
        </button>
      </li>
    </ul>
    <div v-else class="flex h-full items-center justify-center">沒人點歌...ＱＱ</div>
  </section>
</template>
