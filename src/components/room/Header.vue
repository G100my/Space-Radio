<script>
import { ref } from 'vue'
import Marquee from '@/components/Marquee.vue'
// import UserRecentPlayedButton from '@/components/feature-buttons/UserRecentPlayedButton.vue'
import HandwriteLogo from '@/assets/handwriteLogo.svg'
import IconSearch from '@/assets/icons/search.svg'
import IconPerson from '@/assets/icons/person.svg'
import IconPlus from '@/assets/icons/plus.svg'

export default {
  components: {
    IconSearch,
    Marquee,
    // UserRecentPlayedButton,
    HandwriteLogo,
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
  <header class="header z-10" :class="{ 'active-search': isSearchActive }">
    <h1 class="flex items-center justify-center laptop:justify-start">
      <HandwriteLogo />
    </h1>
    <Marquee />
    <nav>
      <ul class="justify-end flex space-x-2">
        <li>
          <button type="button" class="px-3 laptop:py-2 laptop:px-4" @click="$emit('activeSideDrawer')">
            <IconSearch />
          </button>
        </li>
        <li>
          <button
            type="button"
            class="flex text-white px-3 laptop:py-2 laptop:px-4 laptop:border laptop:border-natural-gray2"
            @click="$emit('activeSideDrawer')"
          >
            <IconPlus />
            <label>Add from Spotify</label>
          </button>
        </li>
        <li>
          <button
            class="flex items-center text-white px-3 laptop:py-2 laptop:px-4"
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

  & > .marquee {
    grid-area: marquee;
  }
  & > h1 {
    grid-area: h1;
  }
  & > nav {
    grid-area: nav;
  }

  & li {
    @apply flex;
  }

  & > nav label {
    @apply hidden ml-3 laptop:inline;
  }
}
</style>
