<template>
  <div class="mt-24 relative">
    <button
      type="button"
      class="text-gray-600 flex absolute bottom-full transform -translate-y-5"
      @click="$router.push({ name: 'CreateRoom' }) && unregisterHandler()"
    >
      <IconChevronLeft />
      <span>Go Back</span>
    </button>
    <h2 class="text-subtitle font-semibold mb-4">Create room</h2>
    <form class="text-gray-600">
      <div class="room-setting-form-item">
        <div>
          <label for="minimal-volume">Minimal Volume*</label>
          <BasePlusButton @click="plusMinimal" />
          <span>{{ minimalVolume }}</span>
          <BaseMinusButton @click="minusMinimal" />
        </div>
        <input
          id="minimal-volume"
          min="0"
          max="100"
          type="range"
          :step="step"
          :value="minimalVolume"
          @input="minimalVolumeInputHandler"
        />
      </div>
      <div class="room-setting-form-item">
        <div>
          <label for="initial-volumn">Initial Volumn*</label>
          <BasePlusButton @click="plusVolume" />
          <span>{{ volume }}</span>
          <BaseMinusButton @click="minusVolume" />
        </div>
        <input
          id="initial-volumn"
          min="0"
          max="100"
          type="range"
          :step="step"
          :value="volume"
          @input="volumeInputHandler"
        />
      </div>
      <div class="room-setting-form-item">
        <div>
          <label>Skip Song threshold*</label>
          <BasePlusButton @click="plusDislikeThreshold" />
          <span>{{ dislikeThreshold }}</span>
          <BaseMinusButton @click="minusDislikeThreshold" />
        </div>
      </div>
      <div class="mt-5">
        <p>Choose a playlist as recommendation references</p>
        <select class="w-full p-4 mt-0.5 bg-white border-2 border-black">
          <option>fff</option>
        </select>
      </div>
    </form>
    <button class="btn btn-spotify-bg-green w-full mt-6" type="button" @click="createHandler">Create</button>
  </div>
</template>
<script>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import firebase from '../../store/firebase.js'
import { usePlusMinusHandler } from '../../composables/usePlusMinusHandler.js'

import IconChevronLeft from '../../assets/icons/chevron-left.vue'
import BasePlusButton from '../../components/base/BasePlusButton.vue'
import BaseMinusButton from '../../components/base/BaseMinusButton.vue'

export default {
  components: {
    IconChevronLeft,
    BasePlusButton,
    BaseMinusButton,
  },
  setup() {
    const dislikeThreshold = ref(2)
    const volume = ref(50)
    const minimalVolume = ref(10)
    const step = 5
    const minimalLimit = 10
    watch(minimalVolume, newValue => {
      if (volume.value < newValue) volume.value = newValue
    })

    function minimalVolumeInputHandler(event) {
      if (event.target.value >= minimalLimit) minimalVolume.value = Number(event.target.value)
      else event.target.value = minimalLimit
    }
    function volumeInputHandler(event) {
      if (event.target.value >= minimalVolume.value) volume.value = Number(event.target.value)
      else event.target.value = minimalVolume.value
    }

    const { plus: plusMinimal, minus: minusMinimal } = usePlusMinusHandler(minimalVolume, step, 10, 100)
    const { plus: plusVolume, minus: minusVolume } = usePlusMinusHandler(volume, step, minimalVolume, 100)
    const { plus: plusDislikeThreshold, minus: minusDislikeThreshold } = usePlusMinusHandler(dislikeThreshold, 1, 1, 5)

    //

    const { room_key } = useRoute().params

    function unregisterHandler() {
      firebase.database().ref(`room_list/${room_key}`).remove()
      window.removeEventListener('beforeunload', unregisterHandler)
    }

    window.addEventListener('beforeunload', unregisterHandler)

    function createHandler() {
      const room = firebase.database().ref(room_key)
      room
        .set({
          basic: { ...useRoute().params },
          playing_state: {
            volume: volume.value,
            minimal_volume: minimalVolume.value,
            dislike_threshold: dislikeThreshold.value,
            dislike: 0,
          },
        })
        .then(() => {
          localStorage.setItem('jukebox_room_key')
          window.removeEventListener('beforeunload', unregisterHandler)
          this.$router.push({ name: 'Room' })
        })
    }

    //

    return {
      createHandler,
      unregisterHandler,

      volume,
      minimalVolume,
      dislikeThreshold,
      step,

      minimalVolumeInputHandler,
      volumeInputHandler,

      plusVolume,
      minusVolume,
      plusMinimal,
      minusMinimal,
      plusDislikeThreshold,
      minusDislikeThreshold,
    }
  },
}
</script>
<style lang="postcss">
.room-setting-form-item {
  @apply lg:mt-5;
  & > div {
    @apply flex;
  }
  & label {
    @apply mr-auto;
  }
  & span {
    @apply w-4 mx-3 text-center;
  }
  & input {
    @apply mt-2;
  }
}
.room-setting-form-item + .room-setting-form-item {
  @apply mt-6;
}
</style>
