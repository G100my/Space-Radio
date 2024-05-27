<script lang="ts" setup>
import { ref } from 'vue'
import { Listbox, ListboxButton, ListboxOptions, ListboxOption, TransitionChild, TransitionRoot } from '@headlessui/vue'
import IconDropdown from '@/assets/icons/icon-dropdown.svg?component'
import { useI18n } from 'vue-i18n'

defineProps<{
  options: { id: number | string; name: string }[]
}>()

const { t } = useI18n()
const seleted = ref({ id: null, name: t('choose_one') })
</script>
<template>
  <Listbox v-slot="{ open }" v-model="seleted" as="div" class="relative max-w-lg">
    <ListboxButton
      class="border-tertiary-2 bg-tertiary-1 text-natural-gray1 -shadow-4 flex w-full justify-between rounded border px-4 py-3"
    >
      <span class="overflow-hidden overflow-ellipsis whitespace-nowrap">{{ seleted.name }}</span>
      <IconDropdown />
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
