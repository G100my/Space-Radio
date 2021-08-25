import { computed, watch } from 'vue'
import store from '../store'

function useVolumeControl(playerCallback) {
  // watch currentVolume
  watch(
    () => store.getters.currentVolume,
    newValue => {
      playerCallback(newValue / 100)
    }
  )

  let playerVolume = 50
  // player 音量縮小比例，否則語音音量過小
  const PLAYER_VOLUME_REDUCE_RATE = 0.7
  /**
   * 直接設定音量，有打折
   * @param {*} time
   */
  function updatePlayerVolume(newVolume) {
    playerVolume = newVolume
    if (playerCallback !== null) playerCallback((newVolume / 100) * PLAYER_VOLUME_REDUCE_RATE)
  }

  let recodeVolume
  const ADJUST_PROCESS_TIME = 5000
  const ADJUST_STEP_TIME = 200
  const currentMinimalVolume = computed(() => store.getters.currentMinimalVolume)
  /**
   * 逐漸減少音量到房間設定的最小音量
   * @param {Number} processTime default: 5000
   * @returns Promise
   */
  function reducePlayerVolume(processTime = ADJUST_PROCESS_TIME) {
    return new Promise((resolve, reject) => {
      recodeVolume = playerVolume
      const step = (playerVolume - currentMinimalVolume.value) / (processTime / ADJUST_STEP_TIME)
      const timer = setInterval(() => {
        const afterStep = playerVolume - step
        const targetVolume = (afterStep / 100) * PLAYER_VOLUME_REDUCE_RATE
        console.log(targetVolume)
        try {
          playerCallback(targetVolume)
        } catch (error) {
          clearInterval(timer)
          reject(error)
        }
        if (afterStep < currentMinimalVolume.value) {
          clearInterval(timer)
          resolve()
          return
        }
        playerVolume = afterStep
      }, ADJUST_STEP_TIME)
    })
  }
  /**
   * 逐漸恢復音量
   * @param {Number} processTime default: 5000
   * @returns Promise
   */
  function resumePlayerVolume(processTime = ADJUST_PROCESS_TIME) {
    return new Promise((resolve, reject) => {
      const step = (recodeVolume - playerVolume) / (processTime / ADJUST_STEP_TIME)

      const timer = setInterval(() => {
        const afterStep = playerVolume + step
        const targetVolume = (afterStep / 100) * PLAYER_VOLUME_REDUCE_RATE
        console.log(targetVolume)
        try {
          playerCallback(targetVolume)
        } catch (error) {
          clearInterval(timer)
          reject(error)
        }
        if (afterStep > recodeVolume) {
          clearInterval(timer)
          playerVolume = recodeVolume
          recodeVolume = null
          resolve()
          return
        }
        playerVolume = afterStep
      }, ADJUST_STEP_TIME)
    })
  }

  return {
    resumePlayerVolume,
    reducePlayerVolume,
    updatePlayerVolume,
  }
}

export { useVolumeControl }
