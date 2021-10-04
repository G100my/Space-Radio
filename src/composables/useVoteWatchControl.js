import { computed, watch } from 'vue'
import store from '../store'
import { nextTrack } from './useSpotifyPlayer'
// retrun a watch callback?

const minimalVolume = computed(() => store.getters.currentMinimalVolume)
const currentDislike = computed(() => store.getters.currentDislike)
const currentDislikeThreshold = computed(() => store.getters.currentDislikeThreshold)
const currentDislikeCountdown = computed(() => store.getters.currentDislikeCountdown)

let dislikeCountdownTimer

// const isHostUser = computed(() => store.getters.isHostUser)

/**
 * 直接執行 watch
 * @returns unwatch function
 */
export function useVoteWatch() {
  return watch(currentDislike, newValue => {
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
