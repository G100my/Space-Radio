<script setup lang="ts">
import cloudFunctionAPI from '@/api/cloudFunctionAPI'
import TrackItem from '@/components/TrackItem.vue'
import { usePreviewAudioStore } from '@/stores'
import { BaseSwitch, IconWrapper, usePersonalStore } from 'shared'
import { onMounted, reactive } from 'vue'
import type { SpaceClientData } from 'functions/src/constants'

const data: SpaceClientData = reactive({
  queue: {},
  settings: { all_pass: false },
  sites: {},
})

const audioStore = usePreviewAudioStore()
const personalStore = usePersonalStore()

function handleSwitch(key: keyof typeof data.sites) {
  data.sites[key]['need_review'] = !data.sites[key]['need_review']
}

onMounted(() => {
  if (!personalStore.isTokenValid() || !personalStore.id) {
    console.error('Token/UserID is invalid', personalStore.id)
    return
  }

  cloudFunctionAPI.getSpaceData(personalStore.id).then((res): void => {
    Object.assign(data, res)
  })
})
</script>
<template>
  <main class="flex h-full max-w-lg flex-col p-5">
    <div class="flex-1">
      <ul class="w-full">
        <li v-for="(i, key) in data.queue" :key="key" class="flex gap-3">
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
    <aside class="grid grid-cols-4 justify-end gap-y-3">
      <BaseSwitch
        v-for="(i, key) in data.sites"
        :key="key"
        :label="i.name"
        :modelValue="i.need_review"
        class="text-base"
        @update:modelValue="handleSwitch(key)"
      />
    </aside>
  </main>
</template>
