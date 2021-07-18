<script>
import { ref } from 'vue'
export default {
  props: {
    text: {
      type: String,
      default:
        'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Sunt cumque minima distinctio soluta ullam in dolorum ad, fugit sint sit quas corporis? Rerum, animi? Libero esse velit eos praesentium delectus.',
    },
  },
  setup() {
    const mainSpan = ref(null)
    const isFilled = ref(false)

    const mouseenterHandler = event => {
      const span = event.currentTarget
      if (span.offsetWidth > span.parentElement.offsetWidth) {
        isFilled.value = true
      }
    }
    return {
      mainSpan,
      isFilled,
      mouseenterHandler,
    }
  },
}
</script>
<template>
  <div class="overflow-hidden">
    <p class="_marquee_content" :class="{ active: isFilled }" @animationend="isFilled = false">
      <span ref="mainSpan" @mouseenter="mouseenterHandler">
        <slot>{{ text }}</slot>
      </span>
      <span v-if="isFilled">
        {{ $refs.mainSpan.textContent }}
      </span>
    </p>
  </div>
</template>
<style lang="postcss">
@keyframes marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-100%);
  }
}

._marquee_content {
  @apply text-0 whitespace-nowrap overflow-hidden overflow-ellipsis;

  &:hover span {
    max-width: none;
  }

  > span {
    @apply inline-block text-base text-opacity-50 max-w-full overflow-ellipsis overflow-hidden whitespace-nowrap;
  }

  &.active {
    @apply relative w-fit overflow-ellipsis overflow-visible;
    animation: marquee 10s linear 1;

    > span {
      @apply w-max pr-10;
    }
    > span + span {
      @apply absolute;
    }
  }
}
</style>
