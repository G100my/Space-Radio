<script>
import { useStore } from 'vuex'
import { computed } from 'vue'
import { currentPosition, currentDuration } from '@/composables/useProgressTimer'
import { useI18n } from 'vue-i18n'

export default {
  setup() {
    const store = useStore()
    const dislike = computed(() => store.getters.dislike)
    const dislikeThreshold = computed(() => store.getters.dislikeThreshold)
    const dislikeCountdown = computed(() => store.getters.dislikeCountdown)

    const NO_VOTE_BEFORE_END = 18000
    const nearEnd = computed(() => {
      return currentDuration.value - currentPosition.value < NO_VOTE_BEFORE_END
    })

    return {
      t: useI18n().t,
      isVoted: computed(() => store.getters.isVoted),
      dislike,
      dislikeThreshold,
      dislikeCountdown,
      playerPlayingTrackId: computed(() => store.getters.playerPlayingTrackId),
      nearEnd,
    }
  },
}
</script>
<template>
  <div class="_vote flex flex-col">
    <template v-if="dislikeCountdown">
      <i18n-t keypath="will_cut" tag="p">
        <span>{{ dislikeCountdown }}</span>
        {{ t('second', dislikeCountdown) }}.
      </i18n-t>
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
      class="mt-2 btn-secondary"
      :disabled="!playerPlayingTrackId || nearEnd"
      @click="isVoted ? $store.dispatch('reduceDislike') : $store.dispatch('increaseDislike')"
    >
      {{ isVoted ? t('cancel') : t('vote_for_skip') }}
    </button>
  </div>
</template>
<style lang="postcss">
._vote {
  > p {
    @apply text-natural-gray3 font-bold;
    > span {
      @apply text-primary;
    }
  }
}
</style>
<i18n>
en:
  will_cut: Will skip current music after {0}
  second: second | seconds
  vote_left: '{0} vote left for skip. | {0} votes left for skip.'
  vote_for_skip: Vote for skip
zh:
  will_cut: 將在 {0} 之後切歌
  second: 秒
  vote_left: 再 {vote} 個投票數後切歌
  vote_for_skip: 投票切歌
</i18n>
