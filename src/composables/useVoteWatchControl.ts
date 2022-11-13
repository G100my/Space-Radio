import { computed, watch } from 'vue'
import store from '@/store'

const minimalVolume = computed(() => store.getters.currentMinimalVolume)
const dislike = computed(() => store.getters.dislike)
const dislikeThreshold = computed(() => store.getters.dislikeThreshold)
const dislikeCountdown = computed(() => store.getters.dislikeCountdown)

let dislikeCountdownTimer: ReturnType<typeof setInterval> | null

/**
 * 直接執行 watch
 * @returns unwatch function
 */
// @ts-expect-error
export function useVoteWatch(nextTrack) {
  return watch(dislike, newValue => {
    if (dislikeCountdownTimer) {
      clearInterval(dislikeCountdownTimer)
      dislikeCountdownTimer = null
    }
    if (newValue >= dislikeThreshold.value) {
      let counter = 10
      dislikeCountdownTimer = setInterval(() => {
        counter -= 1
        store.dispatch('updateDislikeCountdown', counter)
        if (counter <= 0) {
          nextTrack(minimalVolume.value)

          if (dislikeCountdownTimer) clearInterval(dislikeCountdownTimer)
          store.dispatch('clearDislikeVote')
          store.dispatch('updateDislikeCountdown', false)
          dislikeCountdownTimer = null
        }
      }, 1000)
    } else if (newValue < dislikeThreshold.value && dislikeCountdown.value) {
      store.dispatch('updateDislikeCountdown', false)
    }
  })
}
