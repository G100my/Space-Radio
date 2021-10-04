<script>
import { computed } from 'vue'
import { currentPosition, currentDuration } from '@/composables/useProgressTimer'

export default {
  setup() {
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

    const position = computed(() => {
      const current = typeCheck(currentPosition.value)

      if (current !== 0) {
        const min = Math.floor(current / 1000 / 60)
        const sec = zeroFormatter(Math.floor((current / 1000) % 60))
        return `${min}:${sec}`
      } else {
        return '--:--'
      }
    })
    const duration = computed(() => {
      const current = typeCheck(currentDuration.value)
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
