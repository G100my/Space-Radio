<script setup lang="ts">
import { useHostStore } from '@/stores'
import { BaseSwitch } from 'shared'

const hostStore = useHostStore()

function handleSwitch(key: keyof typeof hostStore.sites, value: boolean) {
  hostStore.updateSites(key, { need_review: value })
}

function handleAllpassSwitch(value: boolean) {
  hostStore.updateSettings({ top_switch: value })
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
          @update:modelValue="handleSwitch(key, $event)"
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
