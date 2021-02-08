<template>
  <div class="room" @touchstart="touchstartHandler" @touchmove="touchmoveHandler" @touchend="touchendHandler">
    <div ref="slideContainer" class="slide-container">
      <div class="slide-items">
        <PlayingState />
      </div>
      <div class="slide-items" />
    </div>
  </div>
</template>
<script>
import PlayingState from '../components/ThePlayingState.vue'
import { Queue as QueueStore, connect2FirebaseQueue } from '../store/Queue.js'

export default {
  components: {
    PlayingState,
  },
  data() {
    return {
      isMainSide: true,
      touchStartPosition: 0,
    }
  },
  beforeCreate() {
    if (!this.$store.hasModule('Queue')) {
      this.$store.registerModule('Queue', QueueStore)
      connect2FirebaseQueue(this.$store)
    }
  },
  methods: {
    sliderToggler(direction) {
      switch (direction) {
        case 'slide2right':
          this.$refs.slideContainer.style.transform = ''
          this.isMainSide = true
          break
        case 'slide2left':
          this.$refs.slideContainer.style.transform = `translate(-${window.innerWidth}px, 0)`
          this.isMainSide = false
          break
        case 'resume':
          if (this.isMainSide) {
            this.$refs.slideContainer.style.transform = ''
          } else {
            this.$refs.slideContainer.style.transform = `translate(-${window.innerWidth}px, 0)`
          }
          break
        default:
          console.log('something wrong')
          break
      }
    },
    touchstartHandler(event) {
      this.touchStartPosition = event.touches[0].clientX
    },
    touchendHandler(event) {
      const endPosition = event.changedTouches[0].clientX

      if (this.touchStartPosition - endPosition > 70) {
        this.sliderToggler('slide2left')
      } else if (endPosition - this.touchStartPosition > 70) {
        this.sliderToggler('slide2right')
      } else {
        this.sliderToggler('resume')
      }
    },
    touchmoveHandler(event) {
      // left: -,   right: +
      const currentDistance = event.touches[0].clientX - this.touchStartPosition
      if (this.isMainSide) {
        if (currentDistance > 30) {
          return
        } else {
          this.$refs.slideContainer.style.transform = `translate(${currentDistance}px, 0)`
        }
      } else {
        if (currentDistance < -30) {
          return
        } else {
          this.$refs.slideContainer.style.transform = `translate(${-window.innerWidth + currentDistance}px, 0)`
        }
      }
    },
  },
}
</script>
<style lang="scss">
.room {
  position: relative;
  overflow: hidden;
}
.slide-container {
  display: flex;
  transition: transform 0.1s ease-in-out;
}
.slide-items {
  flex-shrink: 0;
  height: 100vh;
  width: 100%;
  box-sizing: border-box;
  &:nth-child(2) {
    background-color: skyblue;
  }
}
</style>
