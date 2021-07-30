<script>
import IconSpotifyDark from '@/assets/icons/icon/spotify-dark.svg'
import IconClose from '@/assets/icons/icon/close.svg'
import { spotifyAPI } from '@/utility/spotifyAPI'
import { computed, onMounted, ref, watch } from '@vue/runtime-core'
import { useStore } from 'vuex'
import { TransitionRoot, TransitionChild, Dialog, DialogOverlay, DialogTitle, DialogDescription } from '@headlessui/vue'
export default {
  components: {
    IconSpotifyDark,
    TransitionRoot,
    TransitionChild,
    Dialog,
    DialogTitle,
    DialogOverlay,
    DialogDescription,
    IconClose,
  },
  setup() {
    const store = useStore()
    const playerPlayingTrackId = computed(() => store.getters.playerPlayingTrackId)

    const ownPlaylists = ref([])
    spotifyAPI.getUserPlaylists().then(results => {
      ownPlaylists.value = results.items
    })

    let roomElement
    onMounted(() => {
      roomElement = document.getElementById('room')
    })

    const isOpen = ref(false)
    watch(isOpen, value => {
      if (value) roomElement.classList.add('blur-sm')
      else roomElement.classList.remove('blur-sm')
    })

    function collectHandler({ id, name }) {
      spotifyAPI.addTracksToPlaylist(id, [`spotify:track:${playerPlayingTrackId.value}`]).then(result => {
        if (result.snapshot_id) {
          isOpen.value = false
          store.dispatch('pushFeedback', `Collect to ${name} successful!`)
        }
      })
    }
    return {
      collectHandler,
      playerPlayingTrackId,
      ownPlaylists,
      isOpen,
    }
  },
}
</script>
<template>
  <div v-bind="$attrs" class="flex flex-col">
    <label class="text-natural-gray3 font-bold">Collect to Spotify</label>
    <button type="button" :disabled="!playerPlayingTrackId" class="btn-primary mt-2" @click="isOpen = !isOpen">
      <IconSpotifyDark />
      <span>Collect to Spotify</span>
    </button>
  </div>

  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog class="fixed inset-0" @close="isOpen = false">
      <TransitionChild
        as="template"
        enter="duration-200 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-150 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <DialogOverlay class="w-screen h-screen bg-tertiary-1 bg-opacity-20 absolute -z-1" />
      </TransitionChild>
      <TransitionChild
        as="template"
        enter="duration-200 ease-out"
        enter-from="opacity-0 scale-95"
        enter-to="opacity-100 scale-100"
        leave="duration-150 ease-in"
        leave-from="opacity-100 scale-100"
        leave-to="opacity-0 scale-95"
      >
        <div
          class="
            absolute
            inset-0
            m-auto
            top-20
            bottom-20
            max-w-xs
            laptop:max-w-xl
            rounded-10
            bg-tertiary-1
            flex flex-col
          "
        >
          <div class="flex items-center bg-tertiary-2 px-8 py-4">
            <DialogTitle class="flex-1 text-subtitle text-natural-gray2">Collect to Spotify</DialogTitle>
            <button type="button" class="btn-tertiary" @click="isOpen = false">
              <IconClose />
            </button>
          </div>
          <DialogDescription as="ul" class="flex-1 overflow-y-auto m-11 space-y-3 laptop:mx-8 laptop:mt-8 laptop:mb-14">
            <li v-for="playlist in ownPlaylists" :key="playlist.id">
              <button
                type="button"
                class="btn-secondary w-full hover:text-tertiary-2 hover:bg-natural-gray2"
                @click="collectHandler(playlist)"
              >
                {{ playlist.name }}
              </button>
            </li>
          </DialogDescription>
        </div>
      </TransitionChild>
    </Dialog>
  </TransitionRoot>
</template>
