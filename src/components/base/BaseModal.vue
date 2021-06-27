<template>
  <teleport to="body">
    <div v-if="isOpen" class="base-modal" @click="isOpen = false">
      <slot />
      <div class="base-modal-mask" />
    </div>
  </teleport>
</template>
<script>
import { ref } from 'vue'
export default {
  setup() {
    const isOpen = ref(false)
    function open() {
      isOpen.value = true
    }
    function close() {
      isOpen.value = false
    }
    return {
      isOpen,
      open,
      close,
    }
  },
}
</script>
<style lang="scss">
.base-modal {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100vw;
  background: rgba(0, 0, 0, 0.3);
  .base-modal-mask {
    width: inherit;
    height: inherit;
  }
}
</style>
