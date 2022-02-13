<script>
import { ref } from 'vue'
import { Listbox, ListboxButton, ListboxOptions, ListboxOption, TransitionChild, TransitionRoot } from '@headlessui/vue'
import IconDropdown from '@/assets/icons/icon-dropdown.svg'
import { useI18n } from 'vue-i18n'

export default {
  components: {
    Listbox,
    ListboxButton,
    ListboxOptions,
    ListboxOption,
    IconDropdown,
    TransitionChild,
    TransitionRoot,
  },
  props: {
    options: {
      type: Array,
      required: true,
    },
  },
  setup() {
    const { t } = useI18n()
    const placeholder = { id: null, name: t('choose_one') }
    return {
      seleted: ref(placeholder),
    }
  },
}
</script>
<template>
  <Listbox v-slot="{ open }" v-model="seleted" as="div" class="relative max-w-lg">
    <ListboxButton
      class="flex w-full justify-between rounded border border-tertiary-2 bg-tertiary-1 px-4 py-3 text-natural-gray1 -shadow-4"
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
        <div class="fixed inset-0 flex items-center justify-center backdrop-blur-sm laptop:hidden" />
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
          class="fixed inset-y-1/4 inset-x-0 z-30 mx-auto max-w-xs -translate-y-1 space-y-0.5 overflow-y-auto rounded rounded-b border border-t-0 border-tertiary-2 bg-tertiary-1 pt-1 pb-2 text-natural-gray3 laptop:absolute laptop:inset-auto laptop:mx-auto laptop:max-h-32 laptop:w-full laptop:max-w-none"
        >
          <ListboxOption
            v-for="(option, index) in options"
            v-slot="{ selected }"
            :key="index"
            :value="option"
            as="template"
          >
            <li
              class="w-full cursor-pointer overflow-hidden overflow-ellipsis whitespace-nowrap px-4 hover:bg-tertiary-2"
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
