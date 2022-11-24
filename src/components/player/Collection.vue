<script lang="ts">
import IconSpotifyDark from '@/assets/icons/icon/spotify-dark.svg?component'
import IconClose from '@/assets/icons/icon/close.svg?component'
import { spotifyAPI } from '@/plugins/spotifyAPI'
import { computed, onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { TransitionRoot, TransitionChild, Dialog, DialogOverlay, DialogTitle, DialogDescription } from '@headlessui/vue'
import { useI18n } from 'vue-i18n'
import { useAlertStore } from '@/store'

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
    const alertStore = useAlertStore()
    const playerPlayingTrackId = computed(() => store.getters.playerPlayingTrackId)

    const ownPlaylists = ref<SpotifyApi.PlaylistObjectSimplified[]>([])
    spotifyAPI.getUserPlaylists().then(results => {
      ownPlaylists.value = results.items
    })

    let roomElement: HTMLElement | null
    onMounted(() => {
      roomElement = document.getElementById('room')
    })

    const isOpen = ref(false)
    watch(isOpen, value => {
      if (value) roomElement?.classList.add('blur-sm')
      else roomElement?.classList.remove('blur-sm')
    })

    function collectHandler({ id, name }: SpotifyApi.PlaylistObjectSimplified) {
      spotifyAPI.addTracksToPlaylist(id, [`spotify:track:${playerPlayingTrackId.value}`]).then(result => {
        if (result.snapshot_id) {
          isOpen.value = false
          alertStore.pushFeedback(`Collect to ${name} successful!`)
        }
      })
    }
    return {
      t: useI18n().t,
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
    <label class="font-bold text-natural-gray3">{{ t('collect_to_spotify') }}</label>
    <button type="button" :disabled="!playerPlayingTrackId" class="btn-primary mt-2" @click="isOpen = !isOpen">
      <IconSpotifyDark />
      <span>{{ t('collect') }}</span>
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
        <DialogOverlay class="absolute -z-1 h-screen w-screen bg-tertiary-1 bg-opacity-20" />
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
          class="absolute inset-0 top-20 bottom-20 m-auto flex max-w-xs flex-col rounded-10 bg-tertiary-1 laptop:max-w-xl"
        >
          <div class="flex items-center bg-tertiary-2 px-8 py-4">
            <DialogTitle class="flex-1 text-subtitle text-natural-gray2">{{ t('collect_to_spotify') }}</DialogTitle>
            <button type="button" class="btn-tertiary" @click="isOpen = false">
              <IconClose />
            </button>
          </div>
          <DialogDescription as="ul" class="m-11 flex-1 space-y-3 overflow-y-auto laptop:mx-8 laptop:mt-8 laptop:mb-14">
            <li v-for="playlist in ownPlaylists" :key="playlist.id">
              <button
                type="button"
                class="btn-secondary w-full hover:bg-natural-gray2 hover:text-tertiary-2"
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
<i18n lang="yaml">
en:
  collect_to_spotify: Collect to Spotify
  collect: Collect!
zh-TW:
  collect_to_spotify: 收藏到 Spotify
  collect: 收藏！
</i18n>
