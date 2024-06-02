<script setup lang="ts">
import { messageOutputMaker } from '@/utility/messageOutputMaker'
import IconSpeaker from '@/assets/icons/icon-announcing.svg?component'
import { Marquee } from 'shared'
import { computed } from 'vue'
import { useLatestOrderStore } from '@/store'

const latestOrder = computed(() => useLatestOrderStore().latest_order)
const messageOutput = computed(() => {
  // fixme, latestOrder shoud be empty after current playing queue finish
  const trackName = latestOrder.value ? latestOrder.value.track_name : ''
  const note = latestOrder.value ? latestOrder.value.note : false
  return messageOutputMaker(note, trackName)
})
</script>
<template>
  <div id="marquee" class="flex flex-nowrap items-center overflow-hidden">
    <IconSpeaker />
    <Marquee :text="messageOutput" class="text-natural-gray1 ml-3 flex-1" />
  </div>
</template>
