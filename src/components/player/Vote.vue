<script>
import { useStore } from 'vuex'
import { computed } from 'vue'

export default {
  setup() {
    const store = useStore()
    return {
      isVoted: computed(() => store.state.PlayingState.isVoted),
      currentDislike: computed(() => store.getters.currentDislike),
      currentDislikeThreshold: computed(() => store.getters.currentDislikeThreshold),
      currentDislikeCountdown: computed(() => store.getters.currentDislikeCountdown),
      playerPlayingTrackId: computed(() => store.getters.playerPlayingTrackId),
    }
  },
}
</script>
<template>
  <div class="_vote flex flex-col">
    <template v-if="currentDislikeCountdown">
      <p>
        Will skip current music after
        <span>{{ currentDislikeCountdown }}</span>
        second{{ currentDislikeCountdown > 1 ? 's' : '' }}.
      </p>
    </template>
    <template v-else>
      <p>
        <span>{{ currentDislikeThreshold - currentDislike }}</span>
        vote{{ currentDislikeThreshold > 1 ? 's' : '' }}
        left for skip.
      </p>
    </template>
    <button
      type="button"
      class="mt-2 btn-secondary"
      :disabled="!playerPlayingTrackId"
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
