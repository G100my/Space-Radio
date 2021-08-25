import store from '@/store/index.js'
import { computed, watch } from 'vue'
import { messageOutputMaker } from '../utility/messageOutputMaker.js'
import { TTS } from '../utility/tts.js'

const pendingQueue = computed(() => store.getters.pendingQueue)

/**
 * @param {Function} reducePlayerVolume
 * @param {Function} resumePlayerVolume
 * @returns unwatch function
 */
function useTTSonPlayer(reducePlayerVolume, resumePlayerVolume) {
  const unwatch = watch(
    pendingQueue,
    pending => {
      console.log(pending)
      if (!pending) return
      else {
        const { track_name, note } = pending
        let messageOutput4TTS = messageOutputMaker(note, track_name)
        messageOutput4TTS = messageOutput4TTS.replace(/[^\w^\s^\u4e00-\u9fa5]/gi, '')

        reducePlayerVolume()
          .then(() => {
            TTS(messageOutput4TTS)
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

export { useTTSonPlayer }
