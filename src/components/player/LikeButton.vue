<script>
import IconLikeFilled from '@/assets/icons/icon/like-filled.svg'
import IconLikeOutlined from '@/assets/icons/icon/like-outlined.svg'
import { spotifyAPI } from '@/plugins/spotifyAPI'
import { usePlayingStore } from '@/store'
import { computed, ref, watch } from 'vue'

export default {
  components: {
    IconLikeFilled,
    IconLikeOutlined,
  },
  setup() {
    const store = usePlayingStore()
    const isTrackSaved = ref(false)
    const playerPlayingTrackId = computed(() => store.playerPlayingTrackId)

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
    class="focus:outline-none flex h-10 w-10 items-center justify-center"
    :disabled="!playerPlayingTrackId"
    @click="isTrackSaved ? removeFromSavedHandler() : add2savedHandler()"
  >
    <IconLikeFilled v-show="isTrackSaved" class="h-6 w-6 text-natural-gray1" />
    <IconLikeOutlined v-show="!isTrackSaved" class="h-6 w-6 text-natural-gray1" />
  </button>
</template>
