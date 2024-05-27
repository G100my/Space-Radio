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
    class="text-natural-white laptop:max-w-none laptop:flex-row laptop:gap-x-[5.5%] laptop:px-0 relative mx-auto flex h-full max-w-sm flex-col items-center px-12"
  >
    <picture class="-z-1 fixed inset-0">
      <source media="(min-width: 640px)" :srcset="desktopBackground" />
      <img :src="mobileBackground" class="h-screen w-screen object-cover object-center" alt="" />
    </picture>

    <h1
      :class="{ 'laptop:flex hidden': $route.name === 'CreateRoom' }"
      class="laptop:h-auto laptop:w-7/12 laptop:justify-center flex h-1/3 w-full items-center"
    >
      <img src="@/assets/images/logo-large.png" class="laptop:w-[300px] w-[120px] md:w-52" alt="" />
    </h1>

    <div class="laptop:mr-10 laptop:h-full laptop:max-w-sm flex w-full flex-1 flex-col">
      <router-view />
    </div>
  </div>
</template>
