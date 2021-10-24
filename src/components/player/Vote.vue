<script>
import { useStore } from 'vuex'
import { computed } from 'vue'
import { currentPosition, currentDuration } from '@/composables/useProgressTimer'

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
      <p>
        Will skip current music after
        <span>{{ dislikeCountdown }}</span>
        second{{ dislikeCountdown > 1 ? 's' : '' }}.
      </p>
    </template>
    <template v-else>
      <p>
        <span>{{ dislikeThreshold - dislike }}</span>
        vote{{ dislikeThreshold > 1 ? 's' : '' }}
        left for skip.
      </p>
    </template>
    <button
      type="button"
      class="mt-2 btn-secondary"
      :disabled="!playerPlayingTrackId || nearEnd"
      @click="isVoted ? $store.dispatch('reduceDislike') : $store.dispatch('increaseDislike')"
    >
      {{ isVoted ? 'Cancel' : 'Vote for skip' }}
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
