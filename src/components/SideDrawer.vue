<script>
import XCircleIcon from '@heroicons/vue/outline/XCircleIcon'

export default {
  components: {
    XCircleIcon,
  },
  emits: ['close'],
}
</script>
<template>
  <transition name="side-drawer">
    <div class="bg-tertiary-1 bg-opacity-60">
      <header class="flex justify-end">
        <button type="button" class="h-10 w-10 bg-red-200" @click="$emit('close')">
          <XCircleIcon @click="$emit('close')" />
        </button>
      </header>
      <slot />
    </div>
  </transition>
</template>
<style lang="postcss">
.side-drawer-leave-active,
.side-drawer-enter-active {
  transition: transform 0.2s ease-in-out;
}
.side-drawer-enter-to,
.side-drawer-leave-from {
  transform: translateX(0);
}
.side-drawer-enter-from,
.side-drawer-leave-to {
  transform: translateX(100%);
}
</style>
