<script>
import IconClose from '@/assets/icons/icon/close.svg'
import { TransitionRoot, TransitionChild } from '@headlessui/vue'
import { onMounted, watch } from 'vue'

export default {
  components: {
    IconClose,
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
  setup(props, { emit }) {
    let roomElement

    function closeHandler() {
      emit('update:modelValue', false)
    }

    onMounted(() => {
      roomElement = document.getElementById('room')
    })

    watch(
      () => props.modelValue,
      newValue => {
        if (newValue) roomElement.classList.add('blur')
        else {
          roomElement.classList.remove('blur')
        }
      }
    )

    return {
      closeHandler,
    }
  },
}
</script>
<template>
  <teleport to="body">
    <TransitionRoot id="side-drawer" :show="modelValue" class="absolute inset-0 z-30">
      <TransitionChild
        as="template"
        enter="duration-200 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-400 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div id="mask" class="absolute h-screen w-screen bg-tertiary-1 bg-opacity-60" @click="closeHandler" />
      </TransitionChild>

      <TransitionChild
        as="template"
        enter="transition ease-in-out duration-400 transform"
        enter-from="translate-x-full"
        enter-to="translate-x-0"
        leave="transition ease-in-out duration-500 transform"
        leave-from="translate-x-0"
        leave-to="translate-x-full"
      >
        <div
          class="bg-tertiary-1 bg-opacity-80 w-screen max-w-xl ml-auto h-screen flex flex-col laptop:w-1/2 px-9 pt-14 pb-8"
        >
          <div class="h-full relative">
            <button type="button" class="btn-tertiary translate-x-2 absolute right-0" @click="closeHandler">
              <IconClose />
            </button>
            <div class="_side_drawer_content h-full">
              <slot />
            </div>
          </div>
        </div>
      </TransitionChild>
    </TransitionRoot>
  </teleport>
</template>
<style lang="postcss">
._side_drawer_content > *:first-child {
  @apply mr-10;
}
</style>
