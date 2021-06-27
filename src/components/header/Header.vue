<script>
import { ref } from 'vue'
import Marquee from '@/components/header/Marquee.vue'
import Logo from '@/assets/images/logo-large.svg'
import IconSearch from '@/assets/icons/icon-search.svg'
import IconPerson from '@/assets/icons/icon/profile.svg'
import IconPlus from '@/assets/icons/icon-plus.svg'

export default {
  components: {
    IconSearch,
    Marquee,
    Logo,
    IconPerson,
    IconPlus,
  },
  emits: ['activeSideDrawer'],
  setup() {
    const isSearchActive = ref(false)
    return {
      isSearchActive,
    }
  },
}
</script>
<template>
  <header
    class="header z-10 px-8 py-8 laptop:p-0 bg-tertiary-1 bg-opacity-60 laptop:bg-transparent laptop:items-center"
  >
    <h1 class="flex items-center justify-start laptop:flex-col laptop:pt-10 laptop:items-start">
      <Logo class="text-natural-white" />
      <h2 class="text-natural-white hidden laptop:block laptop:mt-6">@{{ $store.getters.roomName }}</h2>
    </h1>
    <Marquee class="mt-5 laptop:mt-0" />
    <nav>
      <ul class="justify-end flex">
        <li>
          <button type="button" class="px-3 laptop:py-2 laptop:px-4" @click="$emit('activeSideDrawer')">
            <IconSearch />
          </button>
        </li>
        <li>
          <button
            type="button"
            class="flex text-natural-white px-3 laptop:py-2 laptop:px-4 laptop:border laptop:border-natural-gray2"
            @click="$emit('activeSideDrawer')"
          >
            <IconPlus />
            <label>Add from Spotify</label>
          </button>
        </li>
        <li>
          <button
            class="flex items-center text-natural-white px-3 laptop:py-2 laptop:px-4"
            type="button"
            @click="$emit('activeSideDrawer')"
          >
            <IconPerson />
            <label class="hidden laptop:inline">{{ $store.getters.userName }}</label>
          </button>
        </li>
      </ul>
    </nav>
  </header>
</template>
<style lang="postcss">
.header {
  @apply grid grid-rows-2 grid-cols-2 items-center laptop:flex;

  grid-template-areas: 'h1 nav' 'marquee marquee';

  > #marquee {
    grid-area: marquee;
  }
  > h1 {
    grid-area: h1;
  }
  > nav {
    grid-area: nav;
  }

  li {
    @apply flex;
  }

  > nav label {
    @apply hidden ml-3 laptop:inline;
  }
}
</style>
