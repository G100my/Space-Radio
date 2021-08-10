<script>
import { useStore } from 'vuex'
import { computed, watch } from 'vue'

export default {
  setup() {
    const store = useStore()
    const currentDislike = computed(() => store.getters.currentDislike)
    const currentDislikeThreshold = computed(() => store.getters.currentDislikeThreshold)
    const currentDislikeCountdown = computed(() => store.getters.currentDislikeCountdown)
    const minimalVolume = computed(() => store.getters.currentMinimalVolume)

    const isHostUser = computed(() => store.getters.isHostUser)
    const unwatch = watch(isHostUser, newValue => {
      if (newValue) {
        const {nextTrack} = import("@/composables/useSpotifyPlayer")
        let dislikeCountdownTimer
        watch(currentDislike, newValue => {
          if (dislikeCountdownTimer) {
            clearTimeout(dislikeCountdownTimer)
            dislikeCountdownTimer = null
          }
          if (newValue >= currentDislikeThreshold.value) {
            let counter = 10
            dislikeCountdownTimer = setInterval(() => {
              counter -= 1
              store.dispatch('updateDislikeCountdown', counter)
              if (counter <= 0) {
                nextTrack(minimalVolume.value)
                clearInterval(dislikeCountdownTimer)
                store.dispatch('clearDislikeVote')
                store.dispatch('updateDislikeCountdown', false)
                dislikeCountdownTimer = null
              }
            }, 1000)
          } else if (newValue < currentDislikeThreshold.value && currentDislikeCountdown.value) {
            store.dispatch('updateDislikeCountdown', false)
          }
        })
      }
      unwatch()
    })

    return {
      isVoted: computed(() => store.state.PlayingState.isVoted),
      currentDislike,
      currentDislikeThreshold,
      currentDislikeCountdown,
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
