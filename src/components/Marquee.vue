<template>
  <div class="marquee">
    <div class="container" :class="{ 'active-marquee': isFilled }">
      <p @animationend="isFilled = false">
        <span @mouseenter="mouseenterHandler">{{ messageOutput }}</span>
        <span v-if="isFilled">{{ messageOutput }}</span>
      </p>
    </div>
  </div>
</template>
<script>
import { messageOutputMaker } from '../utility/messageOutputMaker.js'

export default {
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
      const trackName = this.$store.pendingQueue ? this.$store.pendingQueue.name : null
      return messageOutputMaker(this.latestQueue.note, trackName)
    },
  },
  watch: {
    latestQueue() {
      this.isFilled = false
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
<style lang="scss">
.marquee {
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  overflow: hidden;
  display: flex;
  align-items: center;
  transition: flex 0.3s ease-in-out;

  .container {
    width: 100%;
    margin: 0 20px;
    flex-wrap: nowrap;
    overflow: inherit;
  }

  @keyframes marquee {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(-100%);
    }
  }

  p {
    font-size: 0;
    vertical-align: middle;
    overflow: inherit;
    white-space: nowrap;
    text-overflow: ellipsis;
    &:hover {
      span {
        max-width: none;
      }
    }
  }
  span {
    // display: inline-block;
    font-size: 1rem;
    max-width: 100%;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    @media (min-width: 768px) {
      font-size: 2rem;
    }
  }

  .active-marquee {
    p {
      animation: marquee 10s linear 1;
      position: relative;
      width: fit-content;
      text-overflow: initial;
      overflow: initial;
    }
    span {
      width: fit-content;
      padding-right: 300px;
    }
    span + span {
      position: absolute;
    }
  }
}
</style>
