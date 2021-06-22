<template>
  <div id="marquee" class="flex items-center flex-nowrap overflow-hidden">
    <IconSpeaker />
    <div class="flex-1 ml-3 overflow-hidden" :class="{ 'active-marquee': isFilled }">
      <p class="text-0 whitespace-nowrap overflow-hidden overflow-ellipsis" @animationend="isFilled = false">
        <!--  -->
        <span class="marquee-message" @mouseenter="mouseenterHandler">{{ messageOutput }}</span>
        <span v-if="isFilled" class="marquee-message">{{ messageOutput }}</span>
      </p>
    </div>
  </div>
</template>
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
<style lang="postcss">
@keyframes marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-100%);
  }
}
.marquee-message {
  @apply inline-block text-base text-natural-gray1 max-w-full overflow-ellipsis overflow-hidden whitespace-nowrap;
}

#marquee {
  & p:hover span {
    max-width: none;
  }
  & .active-marquee {
    & p {
      @apply relative w-fit overflow-ellipsis overflow-visible;
      animation: marquee 10s linear 1;
    }
    & span {
      @apply w-max pr-10;
    }
    & span + span {
      @apply absolute;
    }
  }
}
</style>
