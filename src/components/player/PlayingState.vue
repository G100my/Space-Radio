<script>
import { computed, defineAsyncComponent } from 'vue'
import { useStore } from 'vuex'
import logo from '@/assets/vinyl-record.png'
import SpotifyLogo from '@/assets/images/Spotify_Logo_CMYK_Green.png'
import ProgressTimer from './ProgressTimer.vue'
import BaseMarquee from '@/components/base/BaseMarquee.vue'
import LikeButton from '@/components/player/LikeButton.vue'

export default {
  components: {
    ProgressTimer,
    LikeButton,
    BaseMarquee,
    PlayToggle: defineAsyncComponent(() => import('@/components/player/PlayToggle.vue')),
  },
  setup() {
    const store = useStore()
    return {
      SpotifyLogo,
      logo,

      playerPlayingAlbum: computed(() => store.getters.playerPlayingAlbum),
      playerPlayingArtists: computed(() => store.getters.playerPlayingArtists),
      playerPlayingTrackName: computed(() => store.getters.playerPlayingTrackName),
      isPremium: computed(() => store.getters.accountLevel === 'premium'),
      isHostUser: computed(() => store.getters.isHostUser),
      customerPlayerMode: computed(() => store.getters.customerPlayerMode),
    }
  },
}
</script>
<template>
  <section class="w-full bg-opacity-40">
    <header class="flex items-center justify-between laptop:hidden">
      <h3 class="text-subtitle text-natural-white">Now</h3>
      <img :src="SpotifyLogo" alt="Spotify" class="w-20" />
    </header>
    <section id="plarer-state" class="flex items-start laptop:flex-col">
      <div
        class="relative flex-shrink-0 bg-tertiary-2 bg-opacity-60 px-5 pt-3 pb-4 laptop:w-10/12 laptop:px-9 laptop:pt-[22px] laptop:pb-7"
      >
        <a :href="playerPlayingAlbum.url" target="_blank">
          <img
            :src="playerPlayingAlbum.image_url ? playerPlayingAlbum.image_url : logo"
            :alt="playerPlayingAlbum.name"
            :title="playerPlayingAlbum.name"
            class="h-20 w-20 laptop:h-auto laptop:w-full"
          />
        </a>
        <PlayToggle
          v-if="isPremium && isHostUser !== undefined && (customerPlayerMode || isHostUser)"
          :isHostUser="isHostUser"
          class="absolute right-0 bottom-0 z-30 translate-y-8 laptop:translate-x-3/4 laptop:translate-y-1/2 sm:translate-y-1/2 sm:translate-x-1/2"
        />
      </div>
      <section
        class="flex w-0 flex-1 flex-col justify-end self-stretch pl-4 laptop:-mt-4 laptop:min-h-[90px] laptop:w-auto laptop:pl-0"
      >
        <section class="flex items-center laptop:relative laptop:w-9/12">
          <p class="flex-1 font-bold text-natural-gray1">{{ playerPlayingTrackName }}</p>
          <LikeButton class="laptop:-top-2 laptop:right-0 laptop:z-30" />
        </section>

        <section class="mt-1 laptop:mt-auto">
          <BaseMarquee class="text-natural-gray1">
            <a v-for="(artists, index) in playerPlayingArtists" :key="index" target="_blank" :href="artists.url">
              {{ artists.name }}
            </a>
          </BaseMarquee>
        </section>

        <section
          class="mt-auto flex translate-y-1/2 justify-end text-primary laptop:mt-2 laptop:transform-none laptop:justify-between"
        >
          <ProgressTimer class="text-opacity-80" />
          <p class="ml-5">{{ '點播人' }}</p>
        </section>
      </section>
    </section>
  </section>
</template>
