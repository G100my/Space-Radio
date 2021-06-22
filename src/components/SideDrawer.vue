<script>
import XCircleIcon from '@heroicons/vue/outline/XCircleIcon'
import { TransitionRoot, TransitionChild } from '@headlessui/vue'

export default {
  components: {
    XCircleIcon,
    TransitionRoot,
    TransitionChild,
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['update:modelValue'],
}
</script>
<template>
  <TransitionRoot :show="modelValue" class="absolute inset-0 z-30">
    <TransitionChild
      enter="duration-200 ease-out"
      enter-from="opacity-0"
      enter-to="opacity-100"
      leave="duration-400 ease-in"
      leave-from="opacity-100"
      leave-to="opacity-0"
    >
      <div
        id="mask"
        class="absolute h-screen w-screen bg-tertiary-1 bg-opacity-60"
        @click="$emit('update:modelValue', false)"
      />
    </TransitionChild>

    <TransitionChild
      enter="transition ease-in-out duration-400 transform"
      enter-from="translate-x-full"
      enter-to="translate-x-0"
      leave="transition ease-in-out duration-500 transform"
      leave-from="translate-x-0"
      leave-to="translate-x-full"
    >
      <div class="relative bg-tertiary-1 bg-opacity-80 w-screen h-screen laptop:w-1/2 laptop:ml-auto">
        <head class="flex justify-end">
          <button type="button" class="text-white h-10 w-10" @click="$emit('update:modelValue', false)">
            <XCircleIcon />
          </button>
        </head>
        <slot />
      </div>
    </TransitionChild>
  </TransitionRoot>
</template>
