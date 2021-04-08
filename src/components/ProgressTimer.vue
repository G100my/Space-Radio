<template>
  <div class="progress-timer">
    <p>
      <span>{{ positionMin }}:{{ positionSec }}</span
      ><span class="midline">/</span><span>{{ durationMin }}:{{ durationSec }}</span>
    </p>
  </div>
</template>
<script>
import { watch, computed, ref } from 'vue'
import { useStore } from 'vuex'

export default {
  setup() {
    const interval = 1000

    const store = useStore()
    const currentProgress = computed(() => store.getters.currentProgress)

    const progressTimer = ref(null)
    const durationMin = ref('-')
    const durationSec = ref('--')
    const positionMin = ref('-')
    const positionSec = ref('--')

    function clearTimeDisplay() {
      positionMin.value = '-'
      positionSec.value = '--'
      durationMin.value = '-'
      durationSec.value = '--'
    }
    function zeroFormatter(num) {
      return num < 10 ? '0'.concat(num) : num
    }
    function typeCheck(item) {
      if (typeof item !== 'number') {
        console.log(`progress time value is not Number, it's ${typeof item}`)
        return Number(item)
      }
      return item
    }

    watch(currentProgress, newProgress => {
      clearInterval(progressTimer.value)
      let { paused, duration, position } = newProgress

      if (duration === 0) {
        clearTimeDisplay()
        return
      }
      if (paused) return

      duration = typeCheck(duration)
      position = typeCheck(position)

      durationMin.value = Math.floor(duration / 1000 / 60)
      durationSec.value = zeroFormatter(Math.floor((duration / 1000) % 60))

      progressTimer.value = setInterval(() => {
        position += 1000
        if (position > duration) {
          clearInterval(progressTimer.value)
          clearTimeDisplay()
        } else {
          positionMin.value = Math.floor(position / 1000 / 60)
          positionSec.value = zeroFormatter(Math.floor((position / 1000) % 60))
        }
      }, interval)
    })
    return {
      durationMin,
      durationSec,
      positionMin,
      positionSec,
      currentProgress,
    }
  },
}
</script>
<style lang="scss">
.progress-timer {
  .midline {
    margin: 0 0.5em;
  }
}
</style>
