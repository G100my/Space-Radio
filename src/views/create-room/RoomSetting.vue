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
          <BasePlusButton @click="test" />
          <span>1</span>
          <BaseMinusButton />
        </div>
        <input id="minimal-volume" type="range" />
      </div>
      <div class="room-setting-form-item">
        <div>
          <label>Initial Volumn*</label>
          <BasePlusButton @click="test" />
          <span>1</span>
          <BaseMinusButton />
        </div>
        <input type="range" />
      </div>
      <div class="room-setting-form-item">
        <div>
          <label>Skip Song threshold*</label>
          <BasePlusButton @click="test" />
          <span>1</span>
          <BaseMinusButton />
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
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import firebase from '../../store/firebase.js'

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
    const { room_key } = useRoute().params
    const volume = ref(50)
    const minimalVolume = ref(10)
    const dislikeThreshold = ref(2)

    const unregisterHandler = () => {
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
    return {
      createHandler,
      unregisterHandler,
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
