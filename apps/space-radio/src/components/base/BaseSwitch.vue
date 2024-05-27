<script lang="ts">
import { Switch as SwitchItem, SwitchGroup, SwitchLabel } from '@headlessui/vue'

export default {
  components: {
    SwitchItem,
    SwitchGroup,
    SwitchLabel,
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
  },
  emits: ['update:modelValue'],
}
</script>
<template>
  <SwitchGroup as="div">
    <SwitchLabel class="mr-4 text-xl">{{ label }}</SwitchLabel>
    <SwitchItem
      :value="String(modelValue)"
      :class="modelValue ? 'bg-primary' : 'bg-natural-gray3'"
      class="relative inline-flex h-[22px] w-[38px] flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
      @click="$emit('update:modelValue')"
      @keypress="
        (event: KeyboardEvent) => {
          if (event.code === 'Enter' || event.code === 'Space') $emit('update:modelValue')
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
