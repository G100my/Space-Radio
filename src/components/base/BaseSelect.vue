<script>
import { ref } from 'vue'
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/vue'
import IconDropdown from '@/assets/icons/icon-dropdown.svg'

export default {
  components: {
    Listbox,
    ListboxButton,
    ListboxOptions,
    ListboxOption,
    IconDropdown,
  },
  props: {
    options: {
      type: Array,
      required: true,
      default: () => [{ id: 1, name: 'default option 1' }],
      validator(income) {
        return Array.isArray(income) && income.length
      },
    },
  },
  setup(props) {
    return {
      seleted: ref(props.options[0]),
    }
  },
}
</script>
<template>
  <Listbox v-model="seleted" as="div" class="relative">
    <ListboxButton
      class="w-full bg-tertiary-1 border border-tertiary-2 rounded -shadow-4 text-natural-gray1 px-4 py-3 flex justify-between focus:outline-none"
    >
      <span>{{ seleted.name }}</span>
      <IconDropdown />
    </ListboxButton>
    <transition
      enterActiveClass="transition duration-100 ease-out"
      enterFromClass="transform scale-95 opacity-0"
      enterToClass="transform scale-100 opacity-100"
      leaveActiveClass="transition duration-75 ease-out"
      leaveFromClass="transform scale-100 opacity-100"
      leaveToClass="transform scale-95 opacity-0"
    >
      <ListboxOptions
        class="absolute w-full pt-1 pb-2 space-y-0.5 -translate-y-1 bg-tertiary-1 border border-t-0 border-tertiary-2 rounded-b z-30 text-natural-gray3"
      >
        <ListboxOption
          v-for="(option, index) in options"
          :key="index"
          v-slot="{ selected }"
          :value="option"
          as="template"
        >
          <li class="w-full px-4 hover:bg-tertiary-2 cursor-pointer" :class="{ 'text-primary': selected }">
            {{ option.name }}
          </li>
        </ListboxOption>
      </ListboxOptions>
    </transition>
  </Listbox>
</template>
