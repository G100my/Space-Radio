<script lang="ts" setup>
import { ref } from 'vue'
import { Listbox, ListboxButton, ListboxOptions, ListboxOption, TransitionChild, TransitionRoot } from '@headlessui/vue'

const props = defineProps<{
  options: { id: number | string; name: string }[]
  placeholder?: string
}>()

const seleted = ref({ id: null, name: props.placeholder || 'Select' })
</script>
<template>
  <Listbox v-slot="{ open }" v-model="seleted" as="div" class="relative max-w-lg">
    <ListboxButton
      class="border-tertiary-2 bg-tertiary-1 text-natural-gray1 -shadow-4 flex w-full justify-between rounded border px-4 py-3"
    >
      <span class="overflow-hidden overflow-ellipsis whitespace-nowrap">{{ seleted.name }}</span>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" fill="none" />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M4.46967 7.96967C4.76256 7.67678 5.23744 7.67678 5.53033 7.96967L12 14.4393L18.4697 7.96967C18.7626 7.67678 19.2374 7.67678 19.5303 7.96967C19.8232 8.26256 19.8232 8.73744 19.5303 9.03033L12.5303 16.0303C12.2374 16.3232 11.7626 16.3232 11.4697 16.0303L4.46967 9.03033C4.17678 8.73744 4.17678 8.26256 4.46967 7.96967Z"
          fill="#F8FAFC"
        />
      </svg>
    </ListboxButton>
    <TransitionRoot v-show="open">
      <TransitionChild
        as="template"
        enter="transition duration-200 ease-in"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="transition duration-200 ease-out"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="laptop:hidden fixed inset-0 flex items-center justify-center backdrop-blur-sm" />
      </TransitionChild>
      <TransitionChild
        as="template"
        enter="transition duration-200 ease-out"
        enter-from="transform scale-95 opacity-0"
        enter-to="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leave-from="transform scale-100 opacity-100"
        leave-to="transform scale-95 opacity-0"
      >
        <ListboxOptions
          class="border-tertiary-2 bg-tertiary-1 text-natural-gray3 laptop:absolute laptop:inset-auto laptop:mx-auto laptop:max-h-32 laptop:w-full laptop:max-w-none fixed inset-x-0 inset-y-1/4 z-30 mx-auto max-w-xs -translate-y-1 space-y-0.5 overflow-y-auto rounded rounded-b border border-t-0 pb-2 pt-1"
        >
          <ListboxOption v-for="option in options" v-slot="{ selected }" :key="option.id" :value="option" as="template">
            <li
              class="hover:bg-tertiary-2 w-full cursor-pointer overflow-hidden overflow-ellipsis whitespace-nowrap px-4"
              :class="{ 'text-primary': selected }"
            >
              {{ option.name }}
            </li>
          </ListboxOption>
        </ListboxOptions>
      </TransitionChild>
    </TransitionRoot>
  </Listbox>
</template>
