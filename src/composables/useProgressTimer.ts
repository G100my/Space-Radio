import { useProgressStore } from '@/store'
import { ref, watch, onUnmounted, type WatchStopHandle } from 'vue'

const INTERVAL = 1000

let progressTimer: null | ReturnType<typeof setInterval> = null

const currentDuration = ref(0)
const currentPosition = ref(0)

let unwatch: WatchStopHandle

export function useProgressTimer() {
  if (!unwatch) {
    unwatch = watch(
      () => useProgressStore().playing_progress,
      newProgress => {
        if (progressTimer) clearInterval(progressTimer)
        if (newProgress === null) return
        const { paused, duration, position } = newProgress
        currentDuration.value = duration
        currentPosition.value = position

        if (paused) {
          if (progressTimer) clearInterval(progressTimer)
          progressTimer = null
          return
        }

        progressTimer = setInterval(() => {
          if (currentPosition.value + 1000 > currentDuration.value && progressTimer) {
            clearInterval(progressTimer)
          }
          currentPosition.value += 1000
        }, INTERVAL)
      }
    )
  }
  onUnmounted(() => {
    unwatch()
  })
  return { currentDuration, currentPosition, unwatch }
}
