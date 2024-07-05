<script setup lang="ts">
import { Switch as SwitchItem, SwitchGroup, SwitchLabel } from '@headlessui/vue'

defineProps<{
  modelValue: boolean
  label: string
}>()
defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()
defineOptions({
  inheritAttrs: false,
})
</script>
<template>
  <SwitchGroup as="template">
    <SwitchLabel class="mr-4">{{ label }}</SwitchLabel>
    <SwitchItem
      :value="String(modelValue)"
      :class="[modelValue ? 'bg-primary' : 'bg-natural-gray3']"
      class="disabled:bg-natural-gray3 relative inline-flex aspect-[38/22] min-w-10 flex-shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
      v-bind="$attrs"
      @click="$emit('update:modelValue', !modelValue)"
      @keypress="
        (event: KeyboardEvent) => {
          if (event.code === 'Enter' || event.code === 'Space') $emit('update:modelValue', !modelValue)
        }
      "
    >
      <span
        aria-hidden="true"
        :class="modelValue ? 'translate-x-1/2' : '-translate-x-1/2'"
        class="pointer-events-none inline-block h-[calc(100%-4px)] w-[calc(50%-1px)] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out"
      />
    </SwitchItem>
  </SwitchGroup>
</template>
