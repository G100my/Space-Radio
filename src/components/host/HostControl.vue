<template>
  <div>
    <Broadcast ref="broadcast" :text="note.message" @speakEnd="resumeVolume" />
    <ThePlayer
      :execute-before-end-time="executeBeforeEndTime"
      :volume="currentVolume"
      :has-note2read="hasNote2read"
      @activeTTS="reduceVolume($refs.broadcast.TTS)"
    />
    <button @click.prevent="reduceVolume($refs.broadcast.TTS)">reduceVolume</button>
    <button @click.prevent="resumeVolume">resumeVolume</button>
    <button @click.prevent="playQueue">playQueue</button>
    <input v-model="currentVolume" type="range" step="0.1" min="0" max="1" />
  </div>
</template>
<script>
import ThePlayer from './ThePlayer.vue'
import Broadcast from './Broadcast.vue'

// 載入歌單  調節播放
export default {
  components: {
    ThePlayer,
    Broadcast,
  },
  data() {
    return {
      note: {
        sender: '',
        message: '',
        recipient: '',
      },
      currentVolume: 1,
      recodeVolume: null,
      targetVolume: 0.1,
      executeBeforeEndTime: 10000,
      adjustTotalTime: 5000,
      adjustStepTime: 100,
    }
  },
  computed: {
    hasNote2read() {
      return Boolean(this.note)
    },
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
    playWholeQueue() {
      this.$spotifyAPI.play({ uris: this.$store.getters.getRoomQueueURIArray })
    },
  },
}
</script>
