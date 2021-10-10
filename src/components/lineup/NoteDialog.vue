<script>
import IconClose from '@/assets/icons/icon/close.svg'

import { Dialog, DialogOverlay, DialogTitle } from '@headlessui/vue'
import { computed } from '@vue/runtime-core'
import { useStore } from 'vuex'
export default {
  components: {
    Dialog,
    DialogOverlay,
    DialogTitle,
    IconClose,
  },
  setup() {
    const store = useStore()

    const isOpen = computed(() => store.getters.isDialogOpen)

    const sender = computed(() => store.getters.noteSender)
    const recipient = computed(() => store.getters.noteRecipient)
    const message = computed(() => store.getters.noteMessage)
    const submitHandler = computed(() => store.getters.noteDialogSubmitHandler)

    function cancelHandler() {
      store.commit('noteDialogToggler', false)
    }

    return {
      isOpen,

      sender,
      recipient,
      message,
      submitHandler,
      cancelHandler,
    }
  },
}
</script>
<template>
  <Dialog :open="isOpen" class="fixed inset-0 z-40 text-natural-gray4" @close="cancelHandler">
    <DialogOverlay class="bg-tertiary-1 bg-opacity-60 h-screen w-screen absolute -z-1" />

    <div class="absolute inset-0 m-auto bg-tertiary-2 rounded-10 h-fit max-w-xs md:max-w-xl lg:max-w-2xl">
      <div class="flex justify-between items-center gap-x-2 py-4 pl-8 pr-4">
        <DialogTitle class="text-subtitle">Any words for your friends?</DialogTitle>
        <button class="btn-tertiary flex-shrink-0" type="button" @click="cancelHandler">
          <IconClose />
        </button>
      </div>
      <div
        class="bg-tertiary-1 pt-6 pb-7 px-4 w-full flex flex-wrap items-baseline gap-x-2 md:gap-x-3 gap-y-2 md:gap-y-3"
      >
        <input
          :value="sender"
          maxlength="16"
          class="base-input w-32 max-w-full"
          type="text"
          @change="$store.commit('editingNote', { sender: $event.target.value })"
        />
        <span>order</span>
        <strong>{{ 'fix you' }}</strong>
        <input
          :value="recipient"
          maxlength="16"
          class="base-input w-32 max-w-full"
          type="text"
          @change="$store.commit('editingNote', { recipient: $event.target.value })"
        />
        <span>say</span>
        <textarea
          :value="message"
          rows="3"
          maxlength="72"
          class="base-input resize-none w-full"
          @change="$store.commit('editingNote', { message: $event.target.value })"
        />
      </div>
      <div class="flex justify-end gap-x-4 py-5 px-8">
        <button class="btn-primary flex-1" @click="submitHandler">Deactivate</button>
        <button class="btn-secondary flex-1" @click="cancelHandler">Cancel</button>
      </div>
    </div>
  </Dialog>
</template>
