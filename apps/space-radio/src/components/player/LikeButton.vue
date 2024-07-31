<script lang="ts">
import IconLikeFilled from '@/assets/icons/icon/like-filled.svg?component'
import IconLikeOutlined from '@/assets/icons/icon/like-outlined.svg?component'
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
    const id = computed(() => store.playerPlayingTrackId)

    function checkSavedTrackState(trackId: string) {
      spotifyAPI.containsMySavedTracks([trackId]).then(result => {
        isTrackSaved.value = result[0]
      })
    }
    function add2savedHandler() {
      spotifyAPI.addToMySavedTracks([id.value]).then(() => {
        checkSavedTrackState(id.value)
      })
    }
    function removeFromSavedHandler() {
      spotifyAPI.removeFromMySavedTracks([id.value]).then(() => {
        checkSavedTrackState(id.value)
      })
    }

    watch(id, newTrackId => {
      if (!newTrackId) return
      checkSavedTrackState(newTrackId)
    })

    return {
      isTrackSaved,

      checkSavedTrackState,
      add2savedHandler,
      removeFromSavedHandler,
      playerPlayingTrackId: id,
    }
  },
}
</script>
<template>
  <button
    type="button"
    class="flex h-10 w-10 items-center justify-center focus:outline-none"
    :disabled="!playerPlayingTrackId"
    @click="isTrackSaved ? removeFromSavedHandler() : add2savedHandler()"
  >
    <IconLikeFilled v-show="isTrackSaved" class="text-natural-gray1 h-6 w-6" />
    <IconLikeOutlined v-show="!isTrackSaved" class="text-natural-gray1 h-6 w-6" />
  </button>
</template>
