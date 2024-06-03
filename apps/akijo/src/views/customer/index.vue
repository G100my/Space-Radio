<script setup lang="ts">
import ImageLogo from '@/assets/logo.svg'
import { routeMap } from '@/router'
import { IconWrapper } from 'shared'
</script>
<template>
  <header class="mb-8 pt-4">
    <h1 class="mx-auto space-x-4 text-center text-3xl">
      <span class="sr-only">Akijo</span>
      <ImageLogo class="inline-block w-1/3" />
      <span>點播電台</span>
    </h1>
  </header>
  <main class="flex-1 overflow-auto">
    <RouterView v-slot="{ Component }">
      <Transition>
        <component :is="Component" />
      </Transition>
    </RouterView>
  </main>
  <footer class="bg-tertiary-2 grid grid-cols-4 border-t-2 border-t-slate-300 px-10 pb-4 pt-3 text-center text-3xl">
    <RouterLink class="w-full" :to="{ name: routeMap.C_playing }">
      <IconWrapper name="play-list-2-fill" />
      <span class="block whitespace-nowrap text-xs">正在播</span>
    </RouterLink>
    <RouterLink class="w-full" :to="{ name: routeMap.C_search }">
      <IconWrapper name="search-line" />
      <span class="block whitespace-nowrap text-xs">搜尋</span>
    </RouterLink>
    <RouterLink class="w-full" :to="{ name: routeMap.C_playlist }">
      <IconWrapper name="play-list-fill" />
      <span class="block whitespace-nowrap text-xs">我的歌單</span>
    </RouterLink>
    <RouterLink class="w-full" :to="{ name: routeMap.C_collects }">
      <IconWrapper name="heart-add-2-line" />
      <span class="block whitespace-nowrap text-xs">收入的歌單</span>
    </RouterLink>
  </footer>
</template>
@/index
