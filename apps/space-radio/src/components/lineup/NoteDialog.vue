<script lang="ts" setup>
import IconClose from '@/assets/icons/icon/close.svg?component'
import { useNoteStore } from '@/store'
import { Dialog as HDialog, DialogOverlay, DialogTitle } from '@headlessui/vue'
import { computed } from 'vue'
import BaseSwitch from '../base/BaseSwitch.vue'

const noteStore = useNoteStore()
const cancelHandler = () => (noteStore.isDialogOpen = false)
const ttsToggle = computed(() => noteStore.editingNote.tts)
const ttsToggleHandler = () => noteStore.updateEditingNote({ tts: !ttsToggle.value })
</script>
<template>
  <HDialog :open="noteStore.isDialogOpen" class="text-natural-gray4 fixed inset-0 z-40" @close="cancelHandler">
    <DialogOverlay class="-z-1 bg-tertiary-1 absolute h-screen w-screen bg-opacity-60" />

    <div class="rounded-10 bg-tertiary-2 absolute inset-0 m-auto h-fit max-w-xs md:max-w-xl lg:max-w-2xl">
      <div class="flex items-center justify-between gap-x-2 py-4 pl-8 pr-4">
        <DialogTitle class="text-subtitle">Any words for your friends?</DialogTitle>
        <button class="btn-tertiary flex-shrink-0" type="button" @click="cancelHandler">
          <IconClose />
        </button>
      </div>
      <div
        class="bg-tertiary-1 flex w-full flex-wrap items-baseline gap-x-2 gap-y-2 px-4 pb-7 pt-6 md:gap-x-3 md:gap-y-3"
      >
        <input
          :value="noteStore.editingNote.sender"
          maxlength="16"
          class="_input w-32 max-w-full"
          type="text"
          @change="noteStore.updateEditingNote({ sender: ($event.target as HTMLInputElement).value })"
        />
        <span>order</span>
        <strong>{{ noteStore.noteTrackName }}</strong>
        <span>to</span>
        <input
          :value="noteStore.editingNote.recipient"
          maxlength="16"
          class="_input w-32 max-w-full"
          type="text"
          @change="noteStore.updateEditingNote({ recipient: ($event.target as HTMLInputElement).value })"
        />
        <span>say</span>
        <textarea
          :value="noteStore.editingNote.message"
          rows="3"
          maxlength="72"
          class="_input w-full resize-none"
          @change="noteStore.updateEditingNote({ message: ($event.target as HTMLInputElement).value })"
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
      <div class="flex justify-end gap-x-4 px-8 py-5">
        <button class="btn-primary flex-1" @click="noteStore.submitHandler(noteStore.editingNote)">Deactivate</button>
        <button class="btn-secondary flex-1" @click="cancelHandler">Cancel</button>
      </div>
    </div>
  </HDialog>
</template>
