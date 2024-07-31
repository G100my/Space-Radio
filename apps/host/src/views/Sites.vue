<script setup lang="ts">
import { hostApi } from '@/api/cloudFunctionAPI'
import { useHostStore } from '@/stores'
import { BaseSwitch, usePersonalStore } from 'shared'

const hostStore = useHostStore()

const personalStore = usePersonalStore()

function handleSwitch(key: keyof typeof hostStore.sites) {
  hostStore.sites[key]['need_review'] = !hostStore.sites[key]['need_review']
}

function handleAllpassSwitch() {
  hostApi.updateAllpass(personalStore.id, { top_switch: !hostStore.settings.top_switch })
}
</script>
<template>
  <div class="flex h-full flex-col">
    <aside class="grid grid-cols-4 justify-end gap-3 pt-5">
      <div class="flex items-center justify-between text-base" v-for="(i, key) in hostStore.sites" :key="key">
        <BaseSwitch
          :key="key"
          :label="i.name"
          :modelValue="i.need_review"
          :disabled="hostStore.settings.top_switch"
          @update:modelValue="handleSwitch(key)"
        />
      </div>
    </aside>

    <aside class="mt-auto flex items-center text-4xl">
      <BaseSwitch
        :modelValue="hostStore.settings.top_switch"
        label="All Pass"
        class="w-14"
        @update:modelValue="handleAllpassSwitch"
      />
    </aside>
  </div>
</template>
