<template>
  <div>
    <h1>TTS</h1>
    <p>text: {{ text }}</p>
    <button @click.prevent="TTS">speak test button</button>
  </div>
  <div v-show="isPlay">{{ text }}</div>
</template>
<script>
export default {
  props: {
    text: {
      type: String,
      required: true,
    },
  },
  emits: ['speakEnd'],
  data() {
    return {
      isPlay: false,
      utterance: new window.SpeechSynthesisUtterance(),
      pitch: 1,
    }
  },
  created() {
    this.utterance.pitch = 1
    this.utterance.rate = 1
    this.utterance.volume = 1
    this.utterance.addEventListener('end', () => {
      this.$emit('speakEnd')
      setTimeout(() => {
        this.isPlay = false
      }, 5000)
    })
    window.speechSynthesis.onvoiceschanged = () => {
      const voice = speechSynthesis
        .getVoices()
        .find(item => item.name.includes('Google') && item.lang.includes('zh-TW'))
      this.utterance.voice = voice
      console.table(this.utterance)
    }
  },
  methods: {
    TTS() {
      this.utterance.text = this.text
      window.speechSynthesis.speak(this.utterance)
      this.isPlay = true
      console.log(this.utterance)
    },
  },
}
</script>
