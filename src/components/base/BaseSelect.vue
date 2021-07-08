<script>
import { ref } from 'vue'
import { Listbox, ListboxButton, ListboxOptions, ListboxOption, TransitionChild, TransitionRoot } from '@headlessui/vue'
import IconDropdown from '@/assets/icons/icon-dropdown.svg'

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
    const placeholder = { id: null, name: 'Choose one' }
    return {
      seleted: ref(placeholder),
    }
  },
}
</script>
<template>
  <Listbox v-slot="{ open }" v-model="seleted" as="div" class="relative max-w-lg">
    <ListboxButton
      class="w-full bg-tertiary-1 text-natural-gray1 border border-tertiary-2 rounded -shadow-4 px-4 py-3 flex justify-between"
    >
      <span class="overflow-ellipsis whitespace-nowrap overflow-hidden">{{ seleted.name }}</span>
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
        <div
          id="select-overlay"
          class="fixed inset-0 flex items-center justify-center backdrop-blur-sm laptop:hidden"
        />
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
          class="pt-1 pb-2 bg-tertiary-1 border border-t-0 border-tertiary-2 rounded rounded-b text-natural-gray3 space-y-0.5 -translate-y-1 overflow-y-auto fixed inset-y-1/4 inset-x-0 max-w-xs mx-auto laptop:absolute laptop:inset-auto z-30 laptop:mx-auto laptop:max-w-none laptop:w-full laptop:max-h-32"
        >
          <ListboxOption
            v-for="(option, index) in options"
            v-slot="{ selected }"
            :key="index"
            :value="option"
            as="template"
          >
            <li
              class="w-full px-4 hover:bg-tertiary-2 cursor-pointer overflow-ellipsis whitespace-nowrap overflow-hidden"
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
