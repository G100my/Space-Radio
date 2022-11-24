import store from '@/store'
import { computed, ref, watch } from 'vue'

const INTERVAL = 1000
const playingProgress = computed(() => store.getters.playingProgress)

let progressTimer: null | ReturnType<typeof setInterval> = null

const currentDuration = ref(0)
const currentPosition = ref(0)

let unwatch
if (!unwatch) {
  console.log('init watch')
  unwatch = watch(playingProgress, newProgress => {
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
  })
}

export { currentDuration, currentPosition, unwatch }
