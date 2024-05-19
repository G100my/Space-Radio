<script lang="ts" setup>
import { computed } from 'vue'
import { useProgressTimer } from '@/composables/useProgressTimer'
import { usePlayingStore, useVoteStore } from '@/store'

const progress = useProgressTimer()
const store = useVoteStore()
const dislike = computed(() => store.dislike)
const dislikeThreshold = computed(() => store.dislike_threshold)
const dislikeCountdown = computed(() => store.dislike_countdown)

const NO_VOTE_BEFORE_END = 18000
const nearEnd = computed(() => {
  return progress.currentDuration.value - progress.currentPosition.value < NO_VOTE_BEFORE_END
})

function handleClick() {
  if (store.isVoted) store.reduceDislike()
  else store.increaseDislike()
  store.isVoted = !store.isVoted
}
const isDisable = computed(() => !usePlayingStore().playerPlayingTrackId || nearEnd.value)
</script>
<template>
  <div class="_vote flex flex-col">
    <template v-if="dislikeCountdown">
      <i18n-t keypath="will_cut" tag="p">
        <template #second>{{ $t('second', { count: dislikeCountdown }) }}.</template>
      </i18n-t>
    </template>
    <template v-else>
      <i18n-t keypath="vote_left" tag="p">
        <template #vote>
          <span>{{ dislikeThreshold - dislike }}</span>
        </template>
      </i18n-t>
    </template>
    <button type="button" class="btn-secondary mt-2" :disabled="isDisable" @click="handleClick">
      {{ store.isVoted ? $t('cancel') : $t('vote_for_skip') }}
    </button>
  </div>
</template>
<style>
._vote > p {
  @apply font-bold text-natural-gray3;
}
._vote > p > span {
  @apply text-primary;
}
</style>
