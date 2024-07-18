<script setup lang="ts">
import ImageLogo from '@/assets/logo.svg'
import { routeMap } from '@/constant'
import { IconWrapper, usePersonalStore } from 'shared'
import SpotifyLogo from 'shared/assets/Spotify_Logo_CMYK_Green.png'

const personalStore = usePersonalStore()
</script>
<template>
  <header class="mb-8 pt-4">
    <h1
      class="mx-auto space-x-4 text-center text-3xl"
      @click="personalStore.clear(), $router.push({ name: routeMap.Login })"
    >
      <span class="sr-only">Akijo</span>
      <ImageLogo class="inline-block w-1/3" />
      <span>點播電台</span>
    </h1>
  </header>
  <main class="relative w-screen max-w-full flex-1 overflow-hidden">
    <RouterView v-slot="{ Component }">
      <Transition>
        <component :is="Component" />
      </Transition>
    </RouterView>
    <div class="bg-tertiary-1 absolute bottom-0 right-0 flex justify-center px-1 pb-0.5">
      <p class="w-fit whitespace-nowrap text-sm">
        All music sources and most image are from
        <img :src="SpotifyLogo" alt="spotify logo" class="ml-2 inline-block h-4" />.
      </p>
    </div>
  </main>
  <footer class="bg-tertiary-2 border-t-2 border-t-slate-300 text-center text-3xl">
    <nav class="grid grid-cols-3 px-10 pb-2 pt-3">
      <RouterLink class="w-full" :to="{ name: routeMap.Playing }">
        <IconWrapper name="play-list-2-fill" />
        <span class="block whitespace-nowrap text-xs">正在播</span>
      </RouterLink>
      <RouterLink class="w-full" :to="{ name: routeMap.Search }">
        <IconWrapper name="search-line" />
        <span class="block whitespace-nowrap text-xs">搜尋</span>
      </RouterLink>
      <RouterLink class="w-full" :to="{ name: routeMap.Playlist }">
        <IconWrapper name="play-list-fill" />
        <span class="block whitespace-nowrap text-xs">我的歌單</span>
      </RouterLink>
    </nav>
  </footer>
</template>
