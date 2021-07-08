<script>
import { computed, defineAsyncComponent } from 'vue'
import { useStore } from 'vuex'
import logo from '@/assets/vinyl-record.png'
import SpotifyLogo from '@/assets/images/Spotify_Logo_CMYK_Green.png'
import ProgressTimer from './ProgressTimer.vue'
import BaseMarquee from '@/components/base/BaseMarquee.vue'
import LikeButton from '@/components/feature-buttons/LikeButton.vue'

export default {
  components: {
    ProgressTimer,
    LikeButton,
    BaseMarquee,
    PlayToggle: defineAsyncComponent(() => import('@/components/feature-buttons/PlayToggle.vue')),
  },
  setup() {
    const store = useStore()
    return {
      SpotifyLogo,
      logo,

      playerPlayingAlbum: computed(() => store.getters.playerPlayingAlbum),
      playerPlayingArtists: computed(() => store.getters.playerPlayingArtists),
      playerPlayingTrackName: computed(() => store.getters.playerPlayingTrackName),
      isHostUser: computed(() => store.getters.isHostUser),
    }
  },
}
</script>
<template>
  <section class="bg-opacity-40 w-full">
    <header class="flex justify-between items-center">
      <h3 class="text-subtitle text-natural-white">Now</h3>
      <img :src="SpotifyLogo" alt="Spotify" class="w-20" />
    </header>
    <section id="plarer-state" class="mt-7 flex items-start laptop:flex-col">
      <div
        class="relative bg-tertiary-2 bg-opacity-60 px-5 pt-3 pb-4 laptop:w-10/12 laptop:px-9 laptop:pt-[22px] laptop:pb-7"
      >
        <a :href="playerPlayingAlbum.url" target="_blank">
          <img
            :src="playerPlayingAlbum.image_url ? playerPlayingAlbum.image_url : logo"
            :alt="playerPlayingAlbum.name"
            :title="playerPlayingAlbum.name"
            class="h-20 w-20 laptop:w-full laptop:h-auto"
          />
        </a>
        <PlayToggle
          v-if="isHostUser"
          class="absolute right-0 bottom-0 translate-y-1/2 translate-x-1/2 laptop:translate-x-3/4 laptop:translate-y-1/2 z-30"
        />
      </div>
      <section class="flex-1 pl-4 self-stretch flex flex-col justify-end laptop:-mt-4 laptop:pl-0 laptop:min-h-[90px]">
        <section class="flex laptop:w-9/12 laptop:relative">
          <p class="flex-1 font-bold text-natural-gray1">{{ playerPlayingTrackName }}</p>
          <LikeButton class="laptop:absolute laptop:-top-2 laptop:right-0 laptop:z-30" />
        </section>

        <section class="mt-1 laptop:mt-auto">
          <BaseMarquee>
            <a v-for="(artists, index) in playerPlayingArtists" :key="index" target="_blank" :href="artists.url">
              {{ artists.name }}
            </a>
          </BaseMarquee>
        </section>

        <section
          class="mt-auto flex justify-end text-primary translate-y-1/2 laptop:justify-between laptop:transform-none laptop:mt-2"
        >
          <ProgressTimer class="text-opacity-80" />
          <p class="ml-5">{{ '點播人' }}</p>
        </section>
      </section>
    </section>
  </section>
</template>
