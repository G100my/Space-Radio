import store from '@/store/index.js'
import { computed, watch } from 'vue'
import { messageOutputMaker } from '../utility/messageOutputMaker.js'

const utterance = new window.SpeechSynthesisUtterance()
utterance.pitch = 1
utterance.rate = 0.75
utterance.volume = 1
utterance.lang = 'zh-TW'

function setTTSVoice() {
  const voice = speechSynthesis.getVoices().find(item => item.name.includes('Google') && item.lang.includes('zh-TW'))
  if (voice !== null) utterance.voice = voice
}

speechSynthesis.onvoiceschanged = () => {
  if (!utterance.voice) setTTSVoice()
}

function TTS(text) {
  return new Promise((resolve, reject) => {
    utterance.onerror = error => {
      console.error('utterance error: ', error)
      reject()
    }
    utterance.onend = () => {
      console.log('utterance end')
      resolve()
    }
    if (utterance.voice === null) setTTSVoice()
    utterance.text = text
    speechSynthesis.speak(utterance)
  })
}

export { TTS }

const pendingOrder = computed(() => store.getters.pendingOrder)

/**
 * @param {Function} reducePlayerVolume
 * @param {Function} resumePlayerVolume
 * @returns unwatch function
 */
function useTTSonPlayer(reducePlayerVolume, resumePlayerVolume) {
  const unwatch = watch(
    pendingOrder,
    pending => {
      console.log(pending)
      if (!pending) return
      else if (!pending.note) return
      else {
        reducePlayerVolume()
          .then(() => {
            TTSbyNote(pending)
          })
          .then(() => resumePlayerVolume())
          .catch(error => {
            console.error(error)
          })
      }
    },
    { deep: true }
  )
  return unwatch
}

/**
 *
 * @param {Order} pending
 * @param {Funtion} reducePlayerVolume
 * @param {Funtion} resumePlayerVolume
 * @returns void
 */
function TTSbyNote(pending) {
  const { track_name, note } = pending
  let messageOutput4TTS = messageOutputMaker(note, track_name)
  messageOutput4TTS = messageOutput4TTS.replace(/[^\w^\s^\u4e00-\u9fa5]/gi, '')
  return TTS(messageOutput4TTS)
}

export { useTTSonPlayer, TTSbyNote }
