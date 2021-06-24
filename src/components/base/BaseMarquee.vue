<script>
export default {
  props: {
    text: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      isFilled: false,
    }
  },
  watch: {
    // when latestQueue exist, play animation
    text(newValue) {
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
  <div class="overflow-hidden">
    <p class="marquee-content" :class="{ active: isFilled }" @animationend="isFilled = false">
      <!--  -->
      <span @mouseenter="mouseenterHandler">{{ text }}</span>
      <span v-if="isFilled">{{ text }}</span>
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

@tailwind components;
@layer components {
  .marquee-content {
    @apply text-0 whitespace-nowrap overflow-hidden overflow-ellipsis;

    &:hover span {
      max-width: none;
    }

    span {
      @apply inline-block text-base text-natural-gray1 text-opacity-50 max-w-full overflow-ellipsis overflow-hidden whitespace-nowrap;
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
