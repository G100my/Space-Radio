<script>
import desktopBackground from '@/assets/images/desktop-bg.jpg'
import mobileBackground from '@/assets/images/mobile-bg.jpg'
import Logo from '@/assets/images/logo-large.svg'

export default {
  components: {
    Logo,
  },
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
    class="mx-auto relative h-full max-w-sm px-12 text-natural-white flex flex-col items-center laptop:max-w-none laptop:px-0 laptop:flex-row laptop:gap-x-[5.5%]"
  >
    <picture class="fixed -z-1 inset-0">
      <source media="(min-width: 640px)" :srcset="desktopBackground" />
      <img :src="mobileBackground" class="w-screen h-screen object-cover object-center" />
    </picture>

    <h1
      :class="{ 'hidden laptop:flex': $route.name === 'CreateRoom' }"
      class="h-1/3 w-full flex items-center laptop:h-auto laptop:w-7/12 laptop:justify-center"
    >
      <Logo class="h-full w-[120px] md:w-52 laptop:w-[300px]" />
    </h1>

    <div class="flex-1 w-full flex flex-col laptop:h-full">
      <router-view />
    </div>
  </div>
</template>
