<script>
import { messageOutputMaker } from '../utility/messageOutputMaker.js'
import IconSpeaker from '@/assets/speaker.svg'

export default {
  components: {
    IconSpeaker,
  },
  data() {
    return {
      isFilled: false,
    }
  },
  computed: {
    latestQueue() {
      return this.$store.getters.latestQueue
    },
    messageOutput() {
      // fixme, latestQueue shoud be empty after current playing queue finish
      const trackName = this.latestQueue ? this.latestQueue.track_name : null
      const note = this.latestQueue ? this.latestQueue.note : false
      return messageOutputMaker(note, trackName)
    },
  },
  watch: {
    // when latestQueue exist, play animation
    latestQueue(newValue) {
      if (newValue) this.isFilled = true
    },
  },
  methods: {
    mouseenterHandler(event) {
      const span = event.currentTarget
      if (span.offsetWidth > span.parentElement.offsetWidth) {
        this.isFilled = true
      }
    },
  },
}
</script>
<template>
  <div id="marquee" class="flex items-center flex-nowrap overflow-hidden">
    <IconSpeaker />
    <div class="flex-1 ml-3 overflow-hidden">
      <p class="marquee-content" :class="{ active: isFilled }" @animationend="isFilled = false">
        <!--  -->
        <span @mouseenter="mouseenterHandler">{{ messageOutput }}</span>
        <span v-if="isFilled">{{ messageOutput }}</span>
      </p>
    </div>
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

@tailwind components;
@layer components {
  .marquee-content {
    @apply text-0 whitespace-nowrap overflow-hidden overflow-ellipsis;

    &:hover span {
      max-width: none;
    }

    span {
      @apply inline-block text-base text-natural-gray1 max-w-full overflow-ellipsis overflow-hidden whitespace-nowrap;
    }

    &.active {
      @apply relative w-fit overflow-ellipsis overflow-visible;
      animation: marquee 10s linear 1;

      span {
        @apply w-max pr-10;
      }
      span + span {
        @apply absolute;
      }
    }
  }
}
</style>
