<script lang="ts">
import { computed } from 'vue'
import { useProgressTimer } from '@/composables/useProgressTimer'
import { useI18n } from 'vue-i18n'
import { usePlayingStore, useVoteStore } from '@/store'

export default {
  setup() {
    const progress = useProgressTimer()
    const store = useVoteStore()
    const dislike = computed(() => store.dislike)
    const dislikeThreshold = computed(() => store.dislike_threshold)
    const dislikeCountdown = computed(() => store.dislike_countdown)

    const NO_VOTE_BEFORE_END = 18000
    const nearEnd = computed(() => {
      return progress.currentDuration.value - progress.currentPosition.value < NO_VOTE_BEFORE_END
    })

    return {
      t: useI18n().t,
      isVoted: computed(() => store.isVoted),
      dislike,
      dislikeThreshold,
      dislikeCountdown,
      playerPlayingTrackId: computed(() => usePlayingStore().playerPlayingTrackId),
      nearEnd,
      store: useVoteStore(),
    }
  },
}
</script>
<template>
  <div class="_vote flex flex-col">
    <template v-if="dislikeCountdown">
      <i18n-t keypath="will_cut" tag="p"> {{ t('second') }}. </i18n-t>
    </template>
    <template v-else>
      <i18n-t keypath="vote_left" tag="p">
        <template #vote>
          <span>{{ dislikeThreshold - dislike }}</span>
        </template>
      </i18n-t>
    </template>
    <button
      type="button"
      class="btn-secondary mt-2"
      :disabled="!playerPlayingTrackId || nearEnd"
      @click="isVoted ? store.reduceDislike() : store.increaseDislike()"
    >
      {{ isVoted ? t('cancel') : t('vote_for_skip') }}
    </button>
  </div>
</template>
<style lang="postcss">
._vote {
  > p {
    @apply font-bold text-natural-gray3;
    > span {
      @apply text-primary;
    }
  }
}
</style>
<i18n lang="yaml">
en:
  will_cut: Will skip current music after {second}
  second: second | seconds
  vote_left: '{vote} vote left for skip. | {vote} votes left for skip.'
  vote_for_skip: Vote for skip
zh-TW:
  will_cut: 將在 {second} 之後切歌
  second: 秒
  vote_left: 再 {vote} 個投票數後切歌
  vote_for_skip: 投票切歌
</i18n>
