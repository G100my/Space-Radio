<script>
import { Switch, SwitchGroup, SwitchLabel } from '@headlessui/vue'

export default {
  components: {
    Switch,
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
    <Switch
      :value="modelValue"
      :class="modelValue ? 'bg-primary' : 'bg-natural-gray3'"
      class="relative inline-flex flex-shrink-0 h-[22px] w-[38px] border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
      @click="$emit('update:modelValue')"
      @keypress="
        event => {
          if (event.code === 'Enter' || event.code === 'Space') $emit('update:modelValue')
        }
      "
    >
      <span class="sr-only">Use setting</span>
      <span
        aria-hidden="true"
        :class="modelValue ? 'translate-x-4' : 'translate-x-0'"
        class="pointer-events-none inline-block h-[18px] w-[18px] rounded-full bg-white shadow-lg transform ring-0 transition ease-in-out duration-200"
      />
    </Switch>
  </SwitchGroup>
</template>
