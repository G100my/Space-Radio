<script>
import IconLikeFilled from '@/assets/icons/icon/like-filled.svg'
import IconLikeOutlined from '@/assets/icons/icon/like-outlined.svg'
import { spotifyAPI } from '@/utility/spotifyAPI'
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'

export default {
  components: {
    IconLikeFilled,
    IconLikeOutlined,
  },
  setup() {
    const store = useStore()
    const isTrackSaved = ref(false)
    const playerPlayingTrackId = computed(() => store.getters.playerPlayingTrackId)

    function checkSavedTrackState(trackId) {
      spotifyAPI.containsMySavedTracks([trackId]).then(result => {
        isTrackSaved.value = result[0]
      })
    }
    function add2savedHandler() {
      spotifyAPI.addToMySavedTracks([playerPlayingTrackId.value]).then(() => {
        checkSavedTrackState(playerPlayingTrackId.value)
      })
    }
    function removeFromSavedHandler() {
      spotifyAPI.removeFromMySavedTracks([playerPlayingTrackId.value]).then(() => {
        checkSavedTrackState(playerPlayingTrackId.value)
      })
    }

    watch(playerPlayingTrackId, newTrackId => {
      if (!newTrackId) return
      checkSavedTrackState(newTrackId)
    })

    return {
      isTrackSaved,

      checkSavedTrackState,
      add2savedHandler,
      removeFromSavedHandler,
      playerPlayingTrackId,
    }
  },
}
</script>
<template>
  <button
    type="button"
    class="w-10 h-10 flex items-center justify-center focus:outline-none"
    :disabled="!playerPlayingTrackId"
    @click="isTrackSaved ? removeFromSavedHandler() : add2savedHandler()"
  >
    <IconLikeFilled v-show="isTrackSaved" class="text-natural-gray1 w-6 h-6" />
    <IconLikeOutlined v-show="!isTrackSaved" class="text-natural-gray1 w-6 h-6" />
  </button>
</template>
