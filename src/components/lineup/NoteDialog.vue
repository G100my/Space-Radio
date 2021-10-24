<script>
import IconClose from '@/assets/icons/icon/close.svg'

import { Dialog, DialogOverlay, DialogTitle } from '@headlessui/vue'
import { computed } from '@vue/runtime-core'
import { useStore } from 'vuex'
import { Switch, SwitchGroup, SwitchLabel } from '@headlessui/vue'
export default {
  components: {
    Dialog,
    DialogOverlay,
    DialogTitle,
    IconClose,
    Switch,
    SwitchGroup,
    SwitchLabel,
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
          class="base-input resize-none w-full"
          @change="$store.commit('editingNote', { message: $event.target.value })"
        />
        <div class="w-full">
          <SwitchGroup as="div" class="flex items-center justify-around">
            <SwitchLabel class="mr-4 text-xl">Active Text to Speach</SwitchLabel>
            <Switch
              :value="ttsToggle"
              :class="ttsToggle ? 'bg-primary' : 'bg-natural-gray3'"
              class="relative inline-flex flex-shrink-0 h-[22px] w-[38px] border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
              @click="ttsToggleHandler"
              @keypress="
                event => {
                  if (event.code === 'Enter' || event.code === 'Space') ttsToggleHandler()
                }
              "
            >
              <span class="sr-only">Use setting</span>
              <span
                aria-hidden="true"
                :class="ttsToggle ? 'translate-x-4' : 'translate-x-0'"
                class="pointer-events-none inline-block h-[18px] w-[18px] rounded-full bg-white shadow-lg transform ring-0 transition ease-in-out duration-200"
              />
            </Switch>
          </SwitchGroup>
        </div>
      </div>
      <div class="flex justify-end gap-x-4 py-5 px-8">
        <button class="btn-primary flex-1" @click="submitHandler">Deactivate</button>
        <button class="btn-secondary flex-1" @click="cancelHandler">Cancel</button>
      </div>
    </div>
  </Dialog>
</template>
