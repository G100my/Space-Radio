<template>
  <div>
    <h1>Host Control</h1>
    <TheBroadcast ref="broadcast" :text="message" @speakEnd="resumeVolume" />
    <ThePlayer :volume="currentVolume" />
    <button @click.prevent="adjustVolume">adjustVolume</button>
    <button @click.prevent="resumeVolume">resumeVolume</button>
    <input v-model="currentVolume" type="range" step="0.1" min="0" max="1" />
  </div>
</template>
<script>
import ThePlayer from '../components/ThePlayer.vue'
import TheBroadcast from '../components/TheBroadcast.vue'

// 載入歌單  調節播放
export default {
  components: {
    ThePlayer,
    TheBroadcast,
  },
  data() {
    return {
      message: 'This is default message!',
      currentVolume: 1,
      recodeVolume: null,
      targetVolume: 0.2,
      adjustTotalTime: 3000,
      adjustStepTime: 100,
    }
  },
  computed: {
    adjustExecuteTimes() {
      return this.adjustTotalTime / this.adjustStepTime
    },
  },
  methods: {
    adjustVolume() {
      this.recodeVolume = this.currentVolume

      const step = (this.currentVolume - this.targetVolume) / this.adjustExecuteTimes

      const timer = setInterval(() => {
        this.currentVolume -= step

        if (this.currentVolume < this.targetVolume) {
          this.$refs.broadcast.TTS()
          clearInterval(timer)
        }
      }, this.adjustStepTime)
    },
    resumeVolume() {
      const step = (this.recodeVolume - this.currentVolume) / this.adjustExecuteTimes

      const timer = setInterval(() => {
        this.currentVolume += step

        if (this.currentVolume + step > this.recodeVolume) {
          clearInterval(timer)
          this.currentVolume = this.recodeVolume
          this.recodeVolume = null
        }
      }, this.adjustStepTime)
    },
  },
}
</script>
