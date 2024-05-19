<script lang="ts" setup>
import IconClose from '@/assets/icons/icon/close.svg?component'
import { TransitionRoot, TransitionChild } from '@headlessui/vue'
import { onMounted, ref, watch, useSlots } from 'vue'
import type { ComponentName } from '../header/RoomHeader.vue'

const props = defineProps<{
  modelValue: boolean
  componentName: ComponentName
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()
const slots = useSlots()

let roomElement: HTMLDivElement
const isDifferantBgColor = ref(false)

function closeHandler() {
  emit('update:modelValue', false)
}

onMounted(() => {
  roomElement = document.getElementById('room') as HTMLDivElement
  if (!slots.default) throw new Error('Must place default solt.')
  isDifferantBgColor.value = ['AddFromStreamingService', 'PlaylistContent'].includes(props.componentName)
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
          :class="{
            'bg-[#303f69] laptop:bg-tertiary-1': isDifferantBgColor,
            'bg-tertiary-2': !isDifferantBgColor,
            'laptop:!w-2/3': componentName === 'Recommendation',
          }"
          class="relative ml-auto h-screen w-screen max-w-xl bg-opacity-40 px-9 pt-20 pb-8 laptop:w-1/2 laptop:max-w-none laptop:px-20"
        >
          <button
            type="button"
            class="btn-tertiary absolute right-9 translate-x-2 -translate-y-12"
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
