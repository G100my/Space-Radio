import { useVolumeStore, useVoteStore } from '@/store'
import { computed, watch, type WatchStopHandle } from 'vue'

let dislikeCountdownTimer: ReturnType<typeof setInterval> | null = null

let unwatch: WatchStopHandle | null = null

function clearCountdownTimer() {
  if (dislikeCountdownTimer) {
    clearInterval(dislikeCountdownTimer)
    dislikeCountdownTimer = null
  }
}

export function useVoteWatch(nextTrack: (volume: number) => void) {
  if (!unwatch) {
    const voteStore = useVoteStore()
    const dislike = computed(() => voteStore.dislike)

    unwatch = watch(dislike, newValue => {
      const isAboveThreshold = newValue >= voteStore.dislike_threshold
      const isCountdownActive = dislikeCountdownTimer !== null

      // 如果倒數已經在進行中
      if (isCountdownActive) {
        // 如果新的 dislike 值低於 threshold，停止倒數
        if (!isAboveThreshold) {
          clearCountdownTimer()
          voteStore.updateDislikeCountdown(false)
        }
        // 如果新的 dislike 值仍然 >= threshold，繼續倒數（不重置）
        return
      }

      // 如果倒數沒有在進行中，且新的 dislike 值 >= threshold，開始倒數
      if (isAboveThreshold) {
        let counter = 10
        dislikeCountdownTimer = setInterval(() => {
          counter -= 1
          voteStore.updateDislikeCountdown(counter)
          if (counter <= 0) {
            clearCountdownTimer()
            nextTrack(useVolumeStore().minimal_volume)
            voteStore.clearDislikeVote()
            voteStore.updateDislikeCountdown(false)
          }
        }, 1000)
      }
    })
  }

  return () => {
    if (unwatch) {
      clearCountdownTimer()
      unwatch()
      unwatch = null
    } else {
      throw new Error("useVoteWatch didn't watch any thing")
    }
  }
}
