import store from '@/store'
import { computed, ref, watch } from 'vue'

const INTERVAL = 1000
const currentProgress = computed(() => store.getters.currentProgress)

let progressTimer = null

const currentDuration = ref(0)
const currentPosition = ref(0)

let unwatch
if (!unwatch) {
  console.log('init watch')
  unwatch = watch(currentProgress, newProgress => {
    clearInterval(progressTimer)
    let { paused, duration, position } = newProgress
    currentDuration.value = duration
    currentPosition.value = position

    if (paused) {
      if (progressTimer) clearInterval(progressTimer)
      progressTimer = null
      return
    }

    progressTimer = setInterval(() => {
      if (currentPosition.value + 1000 > currentDuration.value) {
        clearInterval(progressTimer)
      }
      currentPosition.value += 1000
    }, INTERVAL)
  })
}

export { currentDuration, currentPosition, unwatch }
