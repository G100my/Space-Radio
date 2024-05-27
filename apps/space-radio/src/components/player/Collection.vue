<script lang="ts">
import IconSpotifyDark from '@/assets/icons/icon/spotify-dark.svg?component'
import IconClose from '@/assets/icons/icon/close.svg?component'
import { spotifyAPI } from '@/plugins/spotifyAPI'
import { computed, onMounted, ref, watch } from 'vue'
import {
  TransitionRoot,
  TransitionChild,
  Dialog as HDialog,
  DialogOverlay,
  DialogTitle,
  DialogDescription,
} from '@headlessui/vue'
import { useI18n } from 'vue-i18n'
import { useAlertStore, usePlayingStore } from '@/store'

export default {
  components: {
    IconSpotifyDark,
    TransitionRoot,
    TransitionChild,
    HDialog,
    DialogTitle,
    DialogOverlay,
    DialogDescription,
    IconClose,
  },
  setup() {
    const alertStore = useAlertStore()
    const playingStore = usePlayingStore()
    const playerPlayingTrackId = computed(() => playingStore.playerPlayingTrackId)

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
          alertStore.pushAlert(`Collect to ${name} successful!`)
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
    <label class="text-natural-gray3 font-bold">{{ t('collect_to_spotify') }}</label>
    <button type="button" :disabled="!playerPlayingTrackId" class="btn-primary mt-2" @click="isOpen = !isOpen">
      <IconSpotifyDark />
      <span>{{ t('collect') }}</span>
    </button>
  </div>

  <TransitionRoot appear :show="isOpen" as="template">
    <HDialog class="fixed inset-0" @close="isOpen = false">
      <TransitionChild
        as="template"
        enter="duration-200 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-150 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <DialogOverlay class="-z-1 bg-tertiary-1 absolute h-screen w-screen bg-opacity-20" />
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
          class="rounded-10 bg-tertiary-1 laptop:max-w-xl absolute inset-0 bottom-20 top-20 m-auto flex max-w-xs flex-col"
        >
          <div class="bg-tertiary-2 flex items-center px-8 py-4">
            <DialogTitle class="text-subtitle text-natural-gray2 flex-1">{{ t('collect_to_spotify') }}</DialogTitle>
            <button type="button" class="btn-tertiary" @click="isOpen = false">
              <IconClose />
            </button>
          </div>
          <DialogDescription as="ul" class="laptop:mx-8 laptop:mt-8 laptop:mb-14 m-11 flex-1 space-y-3 overflow-y-auto">
            <li v-for="playlist in ownPlaylists" :key="playlist.id">
              <button
                type="button"
                class="btn-secondary hover:bg-natural-gray2 hover:text-tertiary-2 w-full"
                @click="collectHandler(playlist)"
              >
                {{ playlist.name }}
              </button>
            </li>
          </DialogDescription>
        </div>
      </TransitionChild>
    </HDialog>
  </TransitionRoot>
</template>
