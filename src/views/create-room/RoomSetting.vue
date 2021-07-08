<template>
  <div class="relative">
    <BaseGoBackButton @click="$router.push({ name: 'CreateRoom' }) && unregisterHandler()" />
    <h2 class="text-subtitle font-semibold mb-4">Create room</h2>
    <form class="text-gray-600">
      <div class="room-setting-form-item">
        <div>
          <label for="minimal-volume">Minimal Volume*</label>
          <BaseMinusButton @click="minusMinimal" />
          <span>{{ minimalVolume }}</span>
          <BasePlusButton @click="plusMinimal" />
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
          <BaseMinusButton @click="minusVolume" />
          <span>{{ volume }}</span>
          <BasePlusButton @click="plusVolume" />
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
          <BaseMinusButton @click="minusDislikeThreshold" />
          <span>{{ dislikeThreshold }}</span>
          <BasePlusButton @click="plusDislikeThreshold" />
        </div>
      </div>
      <div class="mt-5">
        <p>Choose a playlist as recommendation references</p>
        <select ref="basePlaylist" class="w-full p-4 mt-0.5 bg-white border-2 border-black">
          <option v-for="playlist in hostPlaylists" :key="playlist.id" :value="playlist.id">{{ playlist.name }}</option>
        </select>
      </div>
    </form>
    <button class="btn-spotify-bg-green w-full mt-6" type="button" @click="createHandler">Create</button>
  </div>
</template>
<script>
import { reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import firebase from '../../store/firebase.js'
import { usePlusMinusHandler } from '../../composables/usePlusMinusHandler.js'
import { spotifyAPI } from '../../utility/spotifyAPI.js'

import BaseGoBackButton from '../../components/base/BaseGoBackButton.vue'
import BasePlusButton from '../../components/base/BasePlusButton.vue'
import BaseMinusButton from '../../components/base/BaseMinusButton.vue'

export default {
  components: {
    BaseGoBackButton,
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

    let hostPlaylists = reactive([])
    const basePlaylist = ref(null)
    spotifyAPI.getUserPlaylists({ limit: 50 }, (error, sucess) => {
      if (error) {
        console.warn('something wrong when try to get host playlist.')
        return
      }
      sucess.items.forEach(item => {
        hostPlaylists.push({
          id: item.id,
          name: item.name,
        })
      })
    })

    //

    const params = useRoute().params
    const room_key = params.room_key
    const router = useRouter()
    function unregisterHandler() {
      firebase.database().ref(`room_list/${room_key}`).remove()
      window.removeEventListener('beforeunload', unregisterHandler)
    }

    window.addEventListener('beforeunload', unregisterHandler)

    function createHandler() {
      const room = firebase.database().ref(room_key)
      room
        .set({
          basic: { base_playlist: basePlaylist.value, ...params },
          playing_state: {
            volume: volume.value,
            minimal_volume: minimalVolume.value,
            dislike_threshold: dislikeThreshold.value,
            dislike: 0,
          },
        })
        .then(() => {
          localStorage.setItem('jukebox_room_key', room_key)
          window.removeEventListener('beforeunload', unregisterHandler)
          router.push({ name: 'Room' })
        })
    }

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

      hostPlaylists,
      basePlaylist,
    }
  },
}
</script>
<style lang="postcss">
.room-setting-form-item {
  @apply lg:mt-5;
  > div {
    @apply flex;
  }
  label {
    @apply mr-auto;
  }
  span {
    @apply w-8 mx-0.5 text-center;
  }
  input {
    @apply mt-2;
  }
}
.room-setting-form-item + .room-setting-form-item {
  @apply mt-6;
}
</style>
