<script setup lang="ts">
import TrackItem from '@/components/TrackItem.vue'
import { usePreviewAudioStore } from '@/stores'
import { BaseSwitch, IconWrapper } from 'shared'
import { reactive } from 'vue'

const fakeData: SpotifyApi.TrackObjectFull[] = []

// A1-A8, B1-B7
const tableList = reactive({
  A1: false,
  A2: false,
})

const audioStore = usePreviewAudioStore()

function handleSwitch(key: keyof typeof tableList) {
  tableList[key] = !tableList[key]
}
</script>
<template>
  <main class="flex h-full max-w-lg flex-col p-5">
    <div class="flex-1">
      <ul class="w-full">
        <li v-for="i in fakeData" :key="i.uri" class="flex gap-3">
          <div class="w-0 flex-1">
            <TrackItem :data="i" class="flex-1" @click="audioStore.toggle(i)" />
          </div>
          <div class="flex-0 space-x-3 text-6xl">
            <button type="button">
              <IconWrapper name="check-line" />
            </button>
            <button type="button">
              <IconWrapper name="close-line" />
            </button>
          </div>
        </li>
      </ul>
    </div>
    <aside class="flex gap-4">
      <BaseSwitch
        v-for="(i, key) in tableList"
        :key="key"
        :label="key"
        :modelValue="i"
        @update:modelValue="handleSwitch(key)"
      />
    </aside>
  </main>
</template>
