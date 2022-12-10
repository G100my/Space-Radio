import { useVolumeStore, useVoteStore } from '@/store'
import { computed, watch, type WatchStopHandle } from 'vue'

let dislikeCountdownTimer: ReturnType<typeof setInterval> | null

let unwatch: WatchStopHandle | null = null

export function useVoteWatch(nextTrack: (volume: number) => void) {
  if (!unwatch) {
    const voteStore = useVoteStore()
    const dislike = computed(() => voteStore.dislike)

    unwatch = watch(dislike, newValue => {
      if (dislikeCountdownTimer) {
        clearInterval(dislikeCountdownTimer)
        dislikeCountdownTimer = null
      }
      if (newValue >= voteStore.dislike_threshold) {
        let counter = 10
        dislikeCountdownTimer = setInterval(() => {
          counter -= 1
          voteStore.updateDislikeCountdown(counter)
          if (counter <= 0) {
            nextTrack(useVolumeStore().minimal_volume)

            if (dislikeCountdownTimer) clearInterval(dislikeCountdownTimer)
            voteStore.clearDislikeVote()
            voteStore.updateDislikeCountdown(false)
            dislikeCountdownTimer = null
          }
        }, 1000)
      } else if (newValue < voteStore.dislike_threshold && voteStore.dislike_countdown) {
        voteStore.updateDislikeCountdown(false)
      }
    })
  }

  return () => {
    if (unwatch) {
      unwatch()
      unwatch = null
    } else {
      throw new Error("useVoteWatch didn't watch any thing")
    }
  }
}
