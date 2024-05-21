<script setup lang="ts">
import ImageLogo from '@/assets/logo.svg'
import { IconWrapper } from 'shared'
</script>
<template>
  <header class="mb-8">
    <h1 class="text-center text-3xl mx-auto space-x-4">
      <span class="sr-only">Akijo</span>
      <ImageLogo class="w-1/3 inline-block" />
      <span>點播電台</span>
    </h1>
  </header>
  <main class="flex-1">
    <RouterView v-slot="{ Component }">
      <Transition>
        <component :is="Component" />
      </Transition>
    </RouterView>
  </main>
  <footer class="grid grid-cols-4 text-3xl px-10 border-t-2 border-t-slate-300 pt-3 pb-1 text-center">
    <RouterLink class="w-full" to="/playing">
      <IconWrapper name="play-list-2-fill" />
      <span class="block text-xs whitespace-nowrap">正在播</span>
    </RouterLink>
    <RouterLink class="w-full" to="/search">
      <IconWrapper name="search-line" />
      <span class="block text-xs whitespace-nowrap">搜尋</span>
    </RouterLink>
    <RouterLink class="w-full" to="/my-playlist">
      <IconWrapper name="play-list-fill" />
      <span class="block text-xs whitespace-nowrap">我的歌單</span>
    </RouterLink>
    <RouterLink class="w-full" to="/collects">
      <IconWrapper name="heart-add-2-line" />
      <span class="block text-xs whitespace-nowrap">收入的歌單</span>
    </RouterLink>
  </footer>
</template>
