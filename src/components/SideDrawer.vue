<script>
import IconClose from '@/assets/icons/icon/close.svg'
import { TransitionRoot, TransitionChild } from '@headlessui/vue'
import { onMounted, ref, watch } from 'vue'

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
  setup(props, { emit, slots }) {
    let roomElement
    const isDifferantBgColor = ref(false)

    function closeHandler() {
      emit('update:modelValue', false)
    }

    onMounted(() => {
      roomElement = document.getElementById('room')
      isDifferantBgColor.value = slots.default()[0].type.name === 'AddFromStreamingService'
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
      isDifferantBgColor,
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
          :class="{ 'bg-[#303f69] laptop:bg-tertiary-1': isDifferantBgColor, 'bg-tertiary-1': !isDifferantBgColor }"
          class="bg-opacity-80 w-screen max-w-xl ml-auto h-screen flex flex-col laptop:w-1/2 laptop:max-w-none px-9 pt-14 pb-8 relative"
        >
          <button
            type="button"
            class="btn-tertiary absolute right-9 translate-x-2 -translate-y-1/2"
            @click="closeHandler"
          >
            <IconClose />
          </button>
          <slot />
        </div>
      </TransitionChild>
    </TransitionRoot>
  </teleport>
</template>
