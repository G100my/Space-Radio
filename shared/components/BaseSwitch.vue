<script setup lang="ts">
import { Switch as SwitchItem, SwitchGroup, SwitchLabel } from '@headlessui/vue'

defineProps<{
  modelValue: boolean
  label: string
}>()
defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()
</script>
<template>
  <SwitchGroup as="div" class="flex items-center">
    <SwitchLabel class="mr-4">{{ label }}</SwitchLabel>
    <SwitchItem
      :value="String(modelValue)"
      :class="modelValue ? 'bg-primary' : 'bg-natural-gray3'"
      class="relative inline-flex h-[22px] w-[38px] flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
      @click="$emit('update:modelValue', !modelValue)"
      @keypress="
        (event: KeyboardEvent) => {
          if (event.code === 'Enter' || event.code === 'Space') $emit('update:modelValue', !modelValue)
        }
      "
    >
      <span class="sr-only">Use setting</span>
      <span
        aria-hidden="true"
        :class="modelValue ? 'translate-x-4' : 'translate-x-0'"
        class="pointer-events-none inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out"
      />
    </SwitchItem>
  </SwitchGroup>
</template>
