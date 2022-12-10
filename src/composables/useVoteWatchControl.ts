import { useVolumeStore, useVoteStore } from '@/store'
import { computed, watch } from 'vue'

const minimalVolume = computed(() => useVolumeStore().minimal_volume)
const dislike = computed(() => useVoteStore().dislike)
const dislikeThreshold = computed(() => useVoteStore().dislike_threshold)
const dislikeCountdown = computed(() => useVoteStore().dislike_countdown)

let dislikeCountdownTimer: ReturnType<typeof setInterval> | null

/**
 * 直接執行 watch
 * @returns unwatch function
 */
export function useVoteWatch(nextTrack: (volume: number) => void) {
  const voteStore = useVoteStore()
  return watch(dislike, newValue => {
    if (dislikeCountdownTimer) {
      clearInterval(dislikeCountdownTimer)
      dislikeCountdownTimer = null
    }
    if (newValue >= dislikeThreshold.value) {
      let counter = 10
      dislikeCountdownTimer = setInterval(() => {
        counter -= 1
        voteStore.updateDislikeCountdown(counter)
        if (counter <= 0) {
          nextTrack(minimalVolume.value)

          if (dislikeCountdownTimer) clearInterval(dislikeCountdownTimer)
          voteStore.clearDislikeVote()
          voteStore.updateDislikeCountdown(false)
          dislikeCountdownTimer = null
        }
      }, 1000)
    } else if (newValue < dislikeThreshold.value && dislikeCountdown.value) {
      voteStore.updateDislikeCountdown(false)
    }
  })
}
