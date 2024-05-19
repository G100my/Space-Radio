<script lang="ts">
import { computed } from 'vue'
import { useProgressTimer } from '@/composables/useProgressTimer'

export default {
  setup() {
    const { currentDuration, currentPosition } = useProgressTimer()
    function zeroFormatter(num: number) {
      return num < 10 ? '0'.concat(String(num)) : num
    }
    const position = computed(() => {
      const current = currentPosition.value

      if (current !== 0) {
        const min = Math.floor(current / 1000 / 60)
        const sec = zeroFormatter(Math.floor((current / 1000) % 60))
        return `${min}:${sec}`
      } else {
        return '--:--'
      }
    })
    const duration = computed(() => {
      const current = currentDuration.value
      if (current !== 0) {
        const min = Math.floor(current / 1000 / 60)
        const sec = zeroFormatter(Math.floor((current / 1000) % 60))
        return `${min}:${sec}`
      } else {
        return '--:--'
      }
    })

    return {
      position,
      duration,
    }
  },
}
</script>
<template>
  <p>
    <span>{{ position }}</span
    ><span class="mx-2">/</span><span>{{ duration }}</span>
  </p>
</template>
