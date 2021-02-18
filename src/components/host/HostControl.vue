<template>
  <div>
    <ThePlayer
      :execute-before-end-time="executeBeforeEndTime"
      :volume="currentVolume"
      :has-note2read="hasNote2read"
      @activetts="reduceVolume(tts)"
    />
    <button type="button" @click="tts">tts</button>
    <button type="button" @click="resumeVolume">resumeVolume</button>
    <button type="button" @click="playQueue">playQueue</button>
    <input v-model="currentVolume" type="range" step="0.1" min="0" max="1" />
  </div>
</template>
<script>
import ThePlayer from './ThePlayer.vue'

// 載入歌單  調節播放
export default {
  components: {
    ThePlayer,
  },
  data() {
    return {
      note: {
        sender: '',
        message: 'Welcome to JukeBox',
        recipient: '',
      },
      currentVolume: 1,
      recodeVolume: null,
      targetVolume: 0.1,
      executeBeforeEndTime: 10000,
      adjustTotalTime: 5000,
      adjustStepTime: 100,
      utterance: new window.SpeechSynthesisUtterance(),
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
  created() {
    this.utterance.pitch = 1
    this.utterance.rate = 1
    this.utterance.volume = 1
    this.utterance.lang = 'zh-TW'
    this.utterance.onstart = () => {
      console.log('utterance start')
    }
    this.utterance.onend = () => {
      console.log('utterance end')
      this.resumeVolume()
    }
    this.utterance.onerror = event => {
      console.log('An error has occurred with the speech synthesis: ' + event.error)
    }
    speechSynthesis.onvoiceschanged = () => {
      console.log('onvoiceschanged')
      this.setVoice()
    }
  },
  methods: {
    setVoice() {
      const voice = speechSynthesis
        .getVoices()
        .find(item => item.name.includes('Google') && item.lang.includes('zh-TW'))
      if (voice !== null) this.utterance.voice = voice
    },
    tts() {
      console.log(this.utterance)
      if (this.utterance.voice === null) this.setVoice()
      this.utterance.text = this.note.message
      speechSynthesis.speak(this.utterance)
    },
    reduceVolume(callback) {
      this.recodeVolume = this.currentVolume

      const step = (this.currentVolume - this.targetVolume) / this.adjustExecuteTimes

      const timer = setInterval(() => {
        this.currentVolume -= step
        if (this.currentVolume < this.targetVolume) {
          callback()
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
