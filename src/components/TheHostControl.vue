<template>
  <div>
    <h1>Host Control</h1>
    <TheBroadcast ref="broadcast" :text="message" @speakEnd="resumeVolume" />
    <ThePlayer
      :execute-before-end-time="executeBeforeEndTime"
      :token="host_token"
      :volume="currentVolume"
      @nearTheEnd="timeoutHandler"
    />
    <button @click.prevent="reduceVolume($refs.broadcast.TTS)">reduceVolume</button>
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
      targetVolume: 0.1,
      executeBeforeEndTime: 10000,
      adjustTotalTime: 5000,
      adjustStepTime: 100,
      host_token: this.$store.state.token,
    }
  },
  computed: {
    adjustExecuteTimes() {
      return this.adjustTotalTime / this.adjustStepTime
    },
  },
  methods: {
    reduceVolume(intervalCallback) {
      this.recodeVolume = this.currentVolume

      const step = (this.currentVolume - this.targetVolume) / this.adjustExecuteTimes

      const timer = setInterval(() => {
        this.currentVolume -= step

        if (this.currentVolume < this.targetVolume) {
          intervalCallback()
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
    timeoutHandler() {
      this.reduceVolume(this.$refs.broadcast.TTS)
    },
  },
}
</script>
