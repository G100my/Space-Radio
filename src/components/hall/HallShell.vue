<script lang="ts">
import desktopBackground from '@/assets/images/desktop-bg.jpg'
import mobileBackground from '@/assets/images/mobile-bg.jpg'

export default {
  setup() {
    return {
      desktopBackground,
      mobileBackground,
    }
  },
}
</script>
<template>
  <div
    id="hall-shell"
    class="relative mx-auto flex h-full max-w-sm flex-col items-center px-12 text-natural-white laptop:max-w-none laptop:flex-row laptop:gap-x-[5.5%] laptop:px-0"
  >
    <picture class="fixed inset-0 -z-1">
      <source media="(min-width: 640px)" :srcset="desktopBackground" />
      <img :src="mobileBackground" class="h-screen w-screen object-cover object-center" alt="" />
    </picture>

    <h1
      :class="{ 'hidden laptop:flex': $route.name === 'CreateRoom' }"
      class="flex h-1/3 w-full items-center laptop:h-auto laptop:w-7/12 laptop:justify-center"
    >
      <img src="@/assets/images/logo-large.png" class="w-[120px] laptop:w-[300px] md:w-52" alt="" />
    </h1>

    <div class="flex w-full flex-1 flex-col laptop:mr-10 laptop:h-full laptop:max-w-sm">
      <router-view />
    </div>
  </div>
</template>
