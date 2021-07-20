<script>
// root element is <div>, can't not place in <p>

import { ref } from 'vue'
export default {
  inheritAttrs: false,
  props: {
    text: {
      type: String,
      default:
        'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Sunt cumque minima distinctio soluta ullam in dolorum ad, fugit sint sit quas corporis? Rerum, animi? Libero esse velit eos praesentium delectus.',
    },
  },
  setup() {
    const mainChild = ref(null)
    const isFilled = ref(false)
    const innerHTML = ref(null)

    const mouseenterHandler = event => {
      const mainChild = event.currentTarget

      if (mainChild.offsetWidth > mainChild.parentElement.offsetWidth) {
        isFilled.value = true
        innerHTML.value = mainChild.innerHTML
      }
    }
    return {
      mainChild,
      isFilled,
      mouseenterHandler,
      innerHTML,
    }
  },
}
</script>
<template>
  <div class="overflow-hidden">
    <p class="_marquee_content" :class="{ active: isFilled }" @animationend="isFilled = false">
      <span ref="mainChild" class="_sentence" v-bind="$attrs" @mouseenter="mouseenterHandler">
        <slot>{{ text }}</slot>
      </span>
      <span v-if="isFilled" v-bind="$attrs" class="_sentence" v-html="innerHTML" />
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

  &:hover ._sentence {
    max-width: none;
  }

  &.active {
    @apply relative w-fit overflow-ellipsis overflow-visible;
    animation: marquee 10s linear 1;

    > ._sentence {
      @apply w-max pr-10;
    }
    > ._sentence + ._sentence {
      @apply absolute;
    }
  }
}
._sentence {
  @apply inline-block text-base text-opacity-50 max-w-full overflow-ellipsis overflow-hidden whitespace-nowrap;
}
</style>
