<template>
  <div class="main-control">
    <button class="play-button" type="button" @click="togglePlay">
      <svg
        v-show="isSpotifyPlayerPaused"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        class="bi bi-play-fill"
        viewBox="0 0 16 16"
      >
        <path
          d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"
        />
      </svg>
      <svg
        v-show="!isSpotifyPlayerPaused"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        class="bi bi-pause-fill"
        viewBox="0 0 16 16"
      >
        <path
          d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"
        />
      </svg>
    </button>
    <button
      class="setting-button"
      type="button"
      :class="{ active: isShowMinimalControlBoard }"
      @click="openSettingHandler"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-gear" viewBox="0 0 16 16">
        <path
          d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"
        />
        <path
          d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"
        />
      </svg>
    </button>
    <div v-show="isShowMinimalControlBoard" class="minimal-control">
      <p>
        <label>Current Device: </label><span>{{ currentActiveDeviceName }}</span>
      </p>
      <p>
        <label for="">Available Devices:</label>
        <select :value="currentActiveDeviceId" @change="ChangeSelectValueHandler">
          <option v-for="device in availableDevice" :key="device.id" :value="device.id">{{ device.name }}</option>
        </select>
      </p>
      <p class="buttons">
        <button type="button" @click="transfer2targetDeviceHandler">transfer to target device</button>
      </p>
      <p>
        <label>Minimal volume:</label>
        <input ref="minimalVolumeInput" :value="currentMinimalVolume" type="number" step="2" min="10" max="50" />
      </p>
      <p>
        <label>Dislike vote threshold:</label>
        <input ref="dislikeThresholdInput" :value="currentDislikeThreshold" type="number" min="2" max="5" />
      </p>
      <div class="buttons">
        <button type="button" @click="submitHandler">submit</button>
        <button type="button" @click="resetHandler">reset</button>
      </div>
    </div>
  </div>
</template>
<script>
import { ref, watch, computed } from 'vue'
import { useStore } from 'vuex'
import { nextTrack, isSpotifyPlayerPaused, deviceActived } from '../composables/useSpotifyPlayer.js'
import { spotifyAPI } from '../plugin/spotify-web-api.js'

export default {
  setup() {
    const store = useStore()
    const currentMinimalVolume = computed(() => store.getters.currentMinimalVolume)
    const currentDislike = computed(() => store.getters.currentDislike)
    const currentDislikeThreshold = computed(() => store.getters.currentDislikeThreshold)

    // DOM element ref
    const dislikeThresholdInput = ref(null)
    const minimalVolumeInput = ref(null)

    let minimalVolume = 50
    let dislikeThreshold = 2
    let dislikeCountdownTimer

    const isShowMinimalControlBoard = ref(false)
    const availableDevice = ref([])
    const currentActiveDeviceId = ref(null)
    const currentActiveDeviceName = ref(null)

    watch(currentDislike, newValue => {
      if (dislikeCountdownTimer && newValue < dislikeThreshold) {
        clearTimeout(dislikeCountdownTimer)
        dislikeCountdownTimer = null
      }
      if (newValue >= dislikeThreshold) {
        let counter = 10
        dislikeCountdownTimer = setInterval(() => {
          counter -= 1
          store.dispatch('updateDislikeCountdown', counter)
          console.log(counter)
          if (counter <= 0) {
            nextTrack(minimalVolume)
            clearInterval(dislikeCountdownTimer)
            store.dispatch('clearDislikeVote')
            store.dispatch('updateDislikeCountdown', false)
            dislikeCountdownTimer = null
          }
        }, 1000)
      }
    })
    spotifyAPI.getMyCurrentPlaybackState().then(result => {
      if (!result) return
      currentActiveDeviceId.value = result.device.id
      currentActiveDeviceName.value = result.device.name
    })

    function togglePlay() {
      spotifyAPI.play()
    }
    function openSettingHandler() {
      isShowMinimalControlBoard.value = !isShowMinimalControlBoard.value
      if (isShowMinimalControlBoard.value === true) {
        spotifyAPI.getMyDevices().then(result => {
          availableDevice.value = result.devices
        })
      }
    }
    function submitHandler() {
      const editedMinimalVolume = Number.parseInt(minimalVolumeInput.value.value)
      if (minimalVolume !== editedMinimalVolume) {
        minimalVolume = editedMinimalVolume
        store.dispatch('updateMinimalVolume', minimalVolume)
      }
      const editedDislikeThreshold = Number.parseInt(dislikeThresholdInput.value.value)
      if (dislikeThreshold !== editedDislikeThreshold) {
        dislikeThreshold = editedDislikeThreshold
        store.dispatch('updateDislikeThreshold', dislikeThreshold)
      }
      isShowMinimalControlBoard.value = false
    }
    function resetHandler() {
      minimalVolumeInput.value = minimalVolume
      dislikeThresholdInput.value = dislikeThreshold
    }
    function ChangeSelectValueHandler(event) {
      currentActiveDeviceId.value = event.target.value
      availableDevice.value.forEach(item => {
        if (item.id === currentActiveDeviceId.value) {
          currentActiveDeviceName.value = item.name
        }
      })
    }
    function transfer2targetDeviceHandler() {
      spotifyAPI.transferMyPlayback([currentActiveDeviceId.value], { play: true }, error => {
        error && console.log(error.response)
        if (!error) {
          deviceActived.value = true
        }
      })
    }

    return {
      minimalVolumeInput,
      dislikeThresholdInput,

      isSpotifyPlayerPaused,
      currentActiveDeviceId,
      currentActiveDeviceName,
      isShowMinimalControlBoard,
      currentMinimalVolume,
      currentDislikeThreshold,
      availableDevice,

      togglePlay,
      openSettingHandler,
      submitHandler,
      resetHandler,
      transfer2targetDeviceHandler,
      ChangeSelectValueHandler,
    }
  },
}
</script>
<style lang="scss">
.main-control {
  position: relative;
  display: flex;
  button {
    padding: 8px 0;
  }
  button + button {
    margin-left: 15px;
  }
  .setting-button,
  .play-button {
    font-size: 0;
    color: var(--primary-neutral);
    width: 100%;
  }
  .setting-button {
    transition: color 0.3s ease-in;
  }
  .setting-button.active {
    color: var(--secondary-highlight);
  }
  svg {
    width: 25px;
    height: 25px;
  }
}
.minimal-control {
  background-color: var(--secondary-dark);
  position: absolute;
  z-index: 100;
  width: 100%;
  box-sizing: border-box;
  bottom: calc(100% + 15px);
  padding: 10px;
  border: 1px solid var(--primary-neutral);
  border-radius: var(--border-radius);
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  p {
    display: flex;
    justify-content: space-between;
  }
  p + p {
    margin-top: 5px;
  }
  span {
    margin-left: 10px;
  }
  input {
    width: 25px;
    background-color: transparent;
    color: var(--primary-light);
    margin-left: 20px;
    margin-right: 15px;
    border: none;
    border-bottom: 1px solid var(--ignore);
    text-align: center;
  }
  .buttons {
    margin-top: 15px;
    display: flex;
    justify-content: flex-end;
    button + button {
      margin-left: 15px;
    }
  }
  @media (min-width: 768px) {
    right: 0;
    bottom: 100%;
    width: max-content;

    input {
      width: 40px;
    }
  }
}
</style>
