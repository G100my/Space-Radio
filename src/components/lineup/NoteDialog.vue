<script>
import IconClose from '@/assets/icons/icon/close.svg'
import { Dialog, DialogOverlay, DialogTitle } from '@headlessui/vue'
import { computed } from '@vue/runtime-core'
import { useStore } from 'vuex'
import BaseSwitch from '../base/BaseSwitch.vue'

export default {
  components: {
    Dialog,
    DialogOverlay,
    DialogTitle,
    IconClose,
    BaseSwitch,
  },
  setup() {
    const store = useStore()

    const isOpen = computed(() => store.getters.isDialogOpen)

    const sender = computed(() => store.getters.noteSender)
    const recipient = computed(() => store.getters.noteRecipient)
    const message = computed(() => store.getters.noteMessage)
    const submitHandler = computed(() => store.getters.noteDialogSubmitHandler)
    const noteTrackName = computed(() => store.getters.noteTrackName)
    function cancelHandler() {
      store.commit('noteDialogToggler', false)
    }

    const ttsToggle = computed(() => store.getters.noteTTS)
    function ttsToggleHandler() {
      store.commit('editingNote', { tts: !ttsToggle.value })
    }

    return {
      isOpen,

      sender,
      noteTrackName,
      recipient,
      message,
      submitHandler,
      cancelHandler,

      ttsToggle,
      ttsToggleHandler,
    }
  },
}
</script>
<template>
  <Dialog :open="isOpen" class="fixed inset-0 z-40 text-natural-gray4" @close="cancelHandler">
    <DialogOverlay class="absolute -z-1 h-screen w-screen bg-tertiary-1 bg-opacity-60" />

    <div class="absolute inset-0 m-auto h-fit max-w-xs rounded-10 bg-tertiary-2 md:max-w-xl lg:max-w-2xl">
      <div class="flex items-center justify-between gap-x-2 py-4 pl-8 pr-4">
        <DialogTitle class="text-subtitle">Any words for your friends?</DialogTitle>
        <button class="btn-tertiary flex-shrink-0" type="button" @click="cancelHandler">
          <IconClose />
        </button>
      </div>
      <div
        class="flex w-full flex-wrap items-baseline gap-x-2 gap-y-2 bg-tertiary-1 px-4 pt-6 pb-7 md:gap-x-3 md:gap-y-3"
      >
        <input
          :value="sender"
          maxlength="16"
          class="base-input w-32 max-w-full"
          type="text"
          @change="$store.commit('editingNote', { sender: $event.target.value })"
        />
        <span>order</span>
        <strong>{{ noteTrackName }}</strong>
        <span>to</span>
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
          class="base-input w-full resize-none"
          @change="$store.commit('editingNote', { message: $event.target.value })"
        />
        <div class="w-full">
          <BaseSwitch
            :modelValue="ttsToggle"
            label="Active Text to Speach"
            class="flex items-center justify-around"
            @update:modelValue="ttsToggleHandler"
          />
        </div>
      </div>
      <div class="flex justify-end gap-x-4 py-5 px-8">
        <button class="btn-primary flex-1" @click="submitHandler">Deactivate</button>
        <button class="btn-secondary flex-1" @click="cancelHandler">Cancel</button>
      </div>
    </div>
  </Dialog>
</template>
