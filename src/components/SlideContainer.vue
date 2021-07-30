<script>
import { onMounted, ref } from 'vue'
import IconNowPlay from '@/assets/icons/icon-nowplay.svg'
import IconNextPlay from '@/assets/icons/icon-nextplay.svg'

export default {
  components: {
    IconNowPlay,
    IconNextPlay,
  },
  setup() {
    const slideContent = ref(null)
    const leftSideButton = ref(null)
    const rightSideButton = ref(null)
    let isMainSide = ref(true)

    const left = ref(0)
    const targetLeft = ref(0)
    const right = ref(0)
    const targetRight = ref(0)
    const animationType = ref(null)

    function computeLeftRight(element) {
      const leftValue = element.offsetLeft
      const rightValue = element.parentElement.offsetWidth - element.offsetLeft - element.offsetWidth
      return { leftValue, rightValue }
    }
    function animationendHandler() {
      left.value = targetLeft.value
      right.value = targetRight.value
    }

    function sliderToggler(direction, element) {
      if (element) {
        const { leftValue, rightValue } = computeLeftRight(element)
        targetLeft.value = leftValue
        targetRight.value = rightValue
      }
      animationType.value = direction

      switch (direction) {
        case 'right2left':
          slideContent.value.style.transform = ''
          isMainSide.value = true
          break
        case 'left2right':
          slideContent.value.style.transform = `translate(${-slideContent.value.offsetWidth / 2}px, 0)`
          isMainSide.value = false
          break
        case 'resume':
          if (isMainSide.value) {
            slideContent.value.style.transform = ''
          } else {
            slideContent.value.style.transform = `translate(${-slideContent.value.offsetWidth / 2}px, 0)`
          }
          break
      }
    }
    let touchStartPosition
    function touchstartHandler(event) {
      touchStartPosition = event.touches[0].clientX
    }
    const moveThreshold = 30
    const disableLimit = 50
    function touchmoveHandler(event) {
      const currentDistance = event.touches[0].clientX - touchStartPosition
      const absoluteDistance = Math.abs(currentDistance)
      const mainSide = isMainSide.value

      if (absoluteDistance < moveThreshold) return

      if (mainSide && currentDistance > disableLimit) return
      if (!mainSide && currentDistance < -disableLimit) return

      if (mainSide) {
        slideContent.value.style.transform = `translate(${currentDistance}px, 0)`
      } else {
        slideContent.value.style.transform = `translate(${-slideContent.value.offsetWidth / 2 + currentDistance}px, 0)`
      }
    }
    const toggleThreshold = 70
    function touchendHandler(event) {
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
    class="bg-tertiary-1 bg-opacity-60 overflow-y-auto laptop:bg-transparent"
    @touchstart="touchstartHandler"
    @touchmove.prevent="touchmoveHandler"
    @touchend="touchendHandler"
  >
    <div
      id="slide-content"
      ref="slideContent"
      class="_show_all_flex w-[200%] h-full flex overflow-y-auto items-stretch transition-transform duration-300 laptop:flex-1 laptop:my-0 laptop:w-auto"
    >
      <div class="flex-shrink-0 w-1/2 px-8 overflow-y-auto laptop:w-96 laptop:pb-10">
        <slot name="left-side" />
      </div>
      <div class="flex-shrink-0 w-1/2 px-8 overflow-y-auto laptop:flex-1 laptop:relative laptop:px-0 laptop:pb-0">
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
      @click="sliderToggler('right2left', $event.currentTarget)"
    >
      <IconNowPlay />
      <span>Now</span>
    </button>
    <button
      ref="rightSideButton"
      :class="{ active: !isMainSide }"
      type="button"
      @click="sliderToggler('left2right', $event.currentTarget)"
    >
      <IconNextPlay />
      <span>Next</span>
    </button>
  </div>
</template>
<style lang="postcss">
._slide_navigation {
  @apply h-16 p-1.5 flex justify-evenly relative laptop:hidden;
  > button {
    @apply h-full w-[77px] rounded-sm flex flex-col items-center focus:outline-none text-natural-gray3;
    svg {
      @apply h-7 w-7 mt-auto;
    }
    span {
      @apply text-xs mb-auto;
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
    @apply absolute bg-[#071A4F] h-1.5 rounded-md top-0;
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
