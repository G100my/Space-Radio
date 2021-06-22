<script>
import { ref } from 'vue'
export default {
  setup() {
    const slideContent = ref(null)
    let isMainSide = ref(true)
    let touchStartPosition

    function touchstartHandler(event) {
      touchStartPosition = event.touches[0].clientX
    }
    function touchendHandler(event) {
      const currentDistance = touchStartPosition - event.changedTouches[0].clientX
      if (Math.abs(currentDistance) < 30) return
      if (currentDistance > 70) {
        sliderToggler('slide2left')
      } else if (currentDistance < 70) {
        sliderToggler('slide2right')
      } else {
        sliderToggler('resume')
      }
    }
    function touchmoveHandler(event) {
      // left: -,   right: +
      const currentDistance = event.touches[0].clientX - touchStartPosition
      if (Math.abs(currentDistance) < 30) return
      if (isMainSide.value) {
        if (currentDistance > 50) {
          return
        } else {
          slideContent.value.style.transform = `translate(${currentDistance}px, 0)`
        }
      } else {
        if (currentDistance < -50) {
          return
        } else {
          slideContent.value.style.transform = `translate(${-window.innerWidth + currentDistance}px, 0)`
        }
      }
    }
    function sliderToggler(direction) {
      switch (direction) {
        case 'slide2right':
          slideContent.value.style.transform = ''
          isMainSide.value = true
          break
        case 'slide2left':
          slideContent.value.style.transform = `translate(-${window.innerWidth}px, 0)`
          isMainSide.value = false
          break
        case 'resume':
          if (isMainSide.value) {
            slideContent.value.style.transform = ''
          } else {
            slideContent.value.style.transform = `translate(-${window.innerWidth}px, 0)`
          }
          break
        default:
          console.log('something wrong')
          break
      }
    }
    return {
      slideContent,
      touchmoveHandler,
      touchstartHandler,
      touchendHandler,
      sliderToggler,
      isMainSide,
    }
  },
}
</script>
<template>
  <div
    id="slide-container"
    class="bg-tertiary-1 bg-opacity-60 overflow-y-auto laptop:bg-transparent"
    @touchstart="touchstartHandler"
    @touchmove="touchmoveHandler"
    @touchend="touchendHandler"
  >
    <div
      ref="slideContent"
      class="show-all-flex w-full h-full flex overflow-y-auto items-stretch transition-transform laptop:flex-1 laptop:my-0"
    >
      <div class="flex-shrink-0 w-full px-8 pb-8 overflow-y-auto laptop:w-96 laptop:px-0 laptop:pb-0">
        <slot name="left-side" />
      </div>
      <div class="flex-shrink-0 w-full px-8 pb-8 flex laptop:flex-1 laptop:relative laptop:px-0 laptop:pb-0">
        <slot name="right-side" />
      </div>
    </div>
  </div>

  <div class="slide-navigation laptop:hidden">
    <button type="button" :class="{ active: isMainSide }" @click="sliderToggler('slide2right')" />
    <button type="button" :class="{ active: !isMainSide }" @click="sliderToggler('slide2left')" />
  </div>
</template>
<style lang="postcss">
.slide-navigation {
  @apply flex justify-center w-full;
  & > button {
    @apply h-10 w-3/12 rounded-sm;
  }
  & > .active {
    @apply bg-yellow-500;
  }
}
</style>
