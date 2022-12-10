<script lang="ts">
import { onMounted, ref } from 'vue'
import IconNowPlay from '@/assets/icons/icon-nowplay.svg?component'
import IconNextPlay from '@/assets/icons/icon-nextplay.svg?component'

export default {
  components: {
    IconNowPlay,
    IconNextPlay,
  },
  setup() {
    const slideContent = ref<HTMLDivElement>()
    const leftSideButton = ref<HTMLButtonElement>()
    const rightSideButton = ref<HTMLButtonElement>()
    let isMainSide = ref(true)

    type SliderDirection = 'left2right' | 'right2left' | 'resume'

    const left = ref(0)
    const targetLeft = ref(0)
    const right = ref(0)
    const targetRight = ref(0)
    const animationType = ref<SliderDirection>()

    function computeLeftRight(element: HTMLButtonElement | undefined) {
      if (!element) return { leftValue: 0, rightValue: 0 }
      const leftValue = element.offsetLeft
      const rightValue = element.parentElement!.offsetWidth - element.offsetLeft - element.offsetWidth
      return { leftValue, rightValue }
    }
    function animationendHandler() {
      left.value = targetLeft.value
      right.value = targetRight.value
    }

    function sliderToggler(direction: SliderDirection, element?: HTMLButtonElement) {
      if (element) {
        const { leftValue, rightValue } = computeLeftRight(element)
        targetLeft.value = leftValue
        targetRight.value = rightValue
      }
      animationType.value = direction

      switch (direction) {
        case 'right2left':
          slideContent.value!.style.transform = ''
          isMainSide.value = true
          break
        case 'left2right':
          slideContent.value!.style.transform = `translate(${-slideContent.value!.offsetWidth / 2}px, 0)`
          isMainSide.value = false
          break
        case 'resume':
          if (isMainSide.value) {
            slideContent.value!.style.transform = ''
          } else {
            slideContent.value!.style.transform = `translate(${-slideContent.value!.offsetWidth / 2}px, 0)`
          }
          break
      }
    }
    let touchStartPosition: number
    function touchstartHandler(event: TouchEvent) {
      touchStartPosition = event.touches[0].clientX
    }
    const moveThreshold = 30
    const disableLimit = 50
    function touchmoveHandler(event: TouchEvent) {
      const currentDistance = event.touches[0].clientX - touchStartPosition
      const absoluteDistance = Math.abs(currentDistance)
      const mainSide = isMainSide.value

      if (absoluteDistance < moveThreshold) return

      if (mainSide && currentDistance > disableLimit) return
      if (!mainSide && currentDistance < -disableLimit) return

      if (mainSide) {
        slideContent.value!.style.transform = `translate(${currentDistance}px, 0)`
      } else {
        slideContent.value!.style.transform = `translate(${
          -slideContent.value!.offsetWidth / 2 + currentDistance
        }px, 0)`
      }
    }
    const toggleThreshold = 70
    function touchendHandler(event: TouchEvent) {
      const currentDistance = touchStartPosition - event.changedTouches[0].clientX
      if (Math.abs(currentDistance) < moveThreshold) return

      if (currentDistance > toggleThreshold) {
        sliderToggler('left2right', rightSideButton.value)
      } else if (currentDistance < -toggleThreshold) {
        sliderToggler('right2left', leftSideButton.value)
      } else {
        sliderToggler('resume')
      }
    }

    onMounted(() => {
      const { leftValue, rightValue } = computeLeftRight(leftSideButton.value)
      left.value = leftValue
      right.value = rightValue
    })

    window.addEventListener('resize', () => {
      if (window.innerWidth > 1200) return
      if (!isMainSide.value) sliderToggler('right2left', leftSideButton.value)
      const { leftValue, rightValue } = computeLeftRight(leftSideButton.value)
      left.value = leftValue
      right.value = rightValue
    })

    return {
      slideContent,
      touchmoveHandler,
      touchstartHandler,
      touchendHandler,
      sliderToggler,
      isMainSide,

      leftSideButton,
      rightSideButton,
      left,
      targetLeft,
      right,
      targetRight,
      animationType,
      animationendHandler,
    }
  },
}
</script>
<template>
  <div
    v-bind="$attrs"
    id="slide-container"
    class="overflow-y-auto bg-tertiary-1 bg-opacity-60 laptop:bg-transparent"
    @touchstart="touchstartHandler"
    @touchmove.prevent="touchmoveHandler"
    @touchend="touchendHandler"
  >
    <div
      id="slide-content"
      ref="slideContent"
      class="_show_all_flex flex h-full w-[200%] items-stretch overflow-y-auto transition-transform duration-300 laptop:my-0 laptop:w-auto laptop:flex-1"
    >
      <div class="w-1/2 flex-shrink-0 overflow-y-auto px-8 laptop:w-96 laptop:pb-10">
        <slot name="left-side" />
      </div>
      <div class="w-1/2 flex-shrink-0 overflow-y-auto px-8 laptop:relative laptop:flex-1 laptop:px-0 laptop:pb-0">
        <slot name="right-side" />
      </div>
    </div>
  </div>

  <div class="_slide_navigation _container bg-tertiary-2">
    <div
      class="_slide_navigation_bar"
      :style="{
        '--left': `${left}px`,
        '--right': `${right}px`,
        '--targetLeft': `${targetLeft}px`,
        '--targetRight': `${targetRight}px`,
        '--animation': animationType,
      }"
      @animationend="animationendHandler"
    />
    <button
      ref="leftSideButton"
      :class="{ active: isMainSide }"
      type="button"
      @click="sliderToggler('right2left', $event.currentTarget as HTMLButtonElement)"
    >
      <slot name="left-btn">
        <IconNowPlay />
        <span>Now</span>
      </slot>
    </button>
    <button
      ref="rightSideButton"
      :class="{ active: !isMainSide }"
      type="button"
      @click="sliderToggler('left2right', $event.currentTarget as HTMLButtonElement)"
    >
      <slot name="right-btn">
        <IconNextPlay />
        <span>Next</span>
      </slot>
    </button>
  </div>
</template>
<style lang="postcss">
._slide_navigation {
  @apply relative flex h-16 justify-evenly p-1.5 laptop:hidden;
  > button {
    @apply focus:outline-none flex h-full w-[77px] flex-col items-center rounded-sm text-natural-gray3;
    svg {
      @apply mt-auto h-7 w-7;
    }
    span {
      @apply mb-auto text-xs;
    }
    svg,
    span {
      transition: color 0.2s linear;
    }
  }
  > button.active {
    @apply text-natural-gray2;
  }

  &_bar {
    @apply absolute top-0 h-1.5 rounded-sm bg-primary;
    left: var(--left);
    right: var(--right);
    animation-name: var(--animation);
    animation-duration: 0.4s;
    animation-iteration-count: 1;
    animation-timing-function: ease-in-out;
  }
  @keyframes left2right {
    0% {
      right: var(--right);
    }
    50% {
      right: var(--targetRight);
      left: var(--left);
    }
    100% {
      right: var(--targetRight);
      left: var(--targetLeft);
    }
  }
  @keyframes right2left {
    0% {
      left: var(--left);
    }
    50% {
      left: var(--targetLeft);
      right: var(--right);
    }
    100% {
      left: var(--targetLeft);
      right: var(--targetRight);
    }
  }
}
</style>
