<script setup lang="ts">
import { computed } from 'vue'
import logo from '@/assets/vinyl-record.png'
import SpotifyLogo from '@/assets/images/Spotify_Logo_CMYK_Green.png'
import ProgressTimer from './ProgressTimer.vue'
import BaseMarquee from '@/components/base/BaseMarquee.vue'
import LikeButton from '@/components/player/LikeButton.vue'
import { usePersonalStore, usePlayingStore, useRoomBasicStore } from '@/store'

const store = usePlayingStore()
const personalStore = usePersonalStore()
const playerPlayingAlbum = computed(() => store.playerPlayingAlbum)
const playerPlayingArtists = computed(() => store.playerPlayingArtists)
const playerPlayingTrackName = computed(() => store.playerPlayingTrackName)
const isPremium = computed(() => personalStore.isPremium)
const isHostUser = computed(() => useRoomBasicStore().isHostUser)
const customerPlayerMode = computed(() => useRoomBasicStore().customerPlayerMode)
</script>
<template>
  <section class="w-full bg-opacity-40">
    <header class="laptop:hidden flex items-center justify-between">
      <h3 class="text-subtitle text-natural-white">Now</h3>
      <img :src="SpotifyLogo" alt="Spotify" class="w-20" />
    </header>
    <section id="plarer-state" class="laptop:flex-col flex items-start">
      <div
        class="bg-tertiary-2 laptop:w-10/12 laptop:px-9 laptop:pt-[22px] laptop:pb-7 relative flex-shrink-0 bg-opacity-60 px-5 pb-4 pt-3"
      >
        <a :href="playerPlayingAlbum.url" target="_blank">
          <img
            :src="playerPlayingAlbum.image_url ? playerPlayingAlbum.image_url : logo"
            :alt="playerPlayingAlbum.name"
            :title="playerPlayingAlbum.name"
            class="laptop:h-auto laptop:w-full h-20 w-20"
          />
          <span class="sr-only">playing track album</span>
        </a>
        <PlayToggle
          v-if="isPremium && isHostUser !== undefined && (customerPlayerMode || isHostUser)"
          :isHostUser="isHostUser"
          class="laptop:translate-x-3/4 laptop:translate-y-1/2 absolute bottom-0 right-0 z-30 translate-y-8 sm:translate-x-1/2 sm:translate-y-1/2"
        />
      </div>
      <section
        class="laptop:-mt-4 laptop:min-h-[90px] laptop:w-auto laptop:pl-0 flex w-0 flex-1 flex-col justify-end self-stretch pl-4"
      >
        <section class="laptop:relative laptop:w-9/12 flex items-center">
          <p class="text-natural-gray1 flex-1 font-bold">{{ playerPlayingTrackName }}</p>
          <LikeButton class="laptop:-top-2 laptop:right-0 laptop:z-30" />
        </section>

        <section class="laptop:mt-auto mt-1">
          <BaseMarquee class="text-natural-gray1">
            <a v-for="(artists, index) in playerPlayingArtists" :key="index" target="_blank" :href="artists.url">
              {{ artists.name }}
            </a>
          </BaseMarquee>
        </section>

        <section
          class="text-primary laptop:mt-2 laptop:transform-none laptop:justify-between mt-auto flex translate-y-1/2 justify-end"
        >
          <ProgressTimer class="text-opacity-80" />
          <p class="ml-5">{{ '點播人' }}</p>
        </section>
      </section>
    </section>
  </section>
</template>
