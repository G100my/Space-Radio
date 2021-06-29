<script>
import { useStore } from 'vuex'
import { computed } from 'vue'

export default {
  setup() {
    const store = useStore()
    return {
      // fixme 目前並沒有 mapGetters 能在 composition api 裡使用...
      isVoted: computed(() => store.state.PlayingState.isVoted),
      currentDislike: computed(() => store.getters.currentDislike),
      currentDislikeThreshold: computed(() => store.getters.currentDislikeThreshold),
      currentDislikeCountdown: computed(() => store.getters.currentDislikeCountdown),
    }
  },
}
</script>
<template>
  <div class="vote flex flex-col">
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
      @click="isVoted ? store.dispatch('reduceDislike') : store.dispatch('increaseDislike')"
    >
      {{ isVoted ? 'Cancel' : 'Vote for skip' }}
    </button>
  </div>
</template>
<style lang="postcss">
.vote {
  > p {
    @apply text-natural-gray3 font-bold;
    > span {
      @apply text-primary;
    }
  }
}
</style>
