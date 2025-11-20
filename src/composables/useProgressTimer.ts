import { useProgressStore } from '@/store'
import { ref, watch, onUnmounted, type WatchStopHandle } from 'vue'

const INTERVAL = 1000

let progressTimer: ReturnType<typeof setInterval> | null = null

const currentDuration = ref(0)
const currentPosition = ref(0)

let progressWatcher: WatchStopHandle | null = null
let subscriberCount = 0

function ensureProgressWatcher() {
  if (!progressWatcher) {
    const progressStore = useProgressStore()
    progressWatcher = watch(
      () => progressStore.playing_progress,
      newProgress => {
        if (progressTimer) {
          clearInterval(progressTimer)
          progressTimer = null
        }
        if (newProgress === null) return
        const { paused, duration, position } = newProgress
        currentDuration.value = duration
        currentPosition.value = position

        if (paused) return

        progressTimer = setInterval(() => {
          const nextPosition = currentPosition.value + INTERVAL
          if (nextPosition >= currentDuration.value) {
            currentPosition.value = currentDuration.value
            if (progressTimer) {
              clearInterval(progressTimer)
              progressTimer = null
            }
            return
          }
          currentPosition.value = nextPosition
        }, INTERVAL)
      }
    )
  }
  subscriberCount += 1
}

function teardownProgressWatcher() {
  subscriberCount -= 1
  if (subscriberCount <= 0) {
    subscriberCount = 0
    if (progressWatcher) {
      progressWatcher()
      progressWatcher = null
    }
    if (progressTimer) {
      clearInterval(progressTimer)
      progressTimer = null
    }
  }
}

export function useProgressTimer() {
  ensureProgressWatcher()
  onUnmounted(() => {
    teardownProgressWatcher()
  })
  return { currentDuration, currentPosition }
}
