<script>
import { ref } from 'vue'
import Marquee from '@/components/header/Marquee.vue'
import Logo from '@/assets/images/logo-large.svg'
import IconSearch from '@/assets/icons/icon-search.svg'
import IconPerson from '@/assets/icons/icon/profile.svg'
import IconPlus from '@/assets/icons/icon-plus.svg'
import FeedbackAlert from './FeedbackAlert.vue'

export default {
  components: {
    IconSearch,
    Marquee,
    Logo,
    IconPerson,
    IconPlus,
    FeedbackAlert,
  },
  emits: ['activeSideDrawer'],
  setup(_props, { emit }) {
    const isSearchActive = ref(false)
    function activeSideDrawerHandler(componentName) {
      emit('activeSideDrawer', componentName)
    }
    return {
      isSearchActive,
      activeSideDrawerHandler,
    }
  },
}
</script>
<template>
  <header
    class="flex-col laptop:flex-row relative header z-10 px-8 py-8 laptop:p-0 bg-tertiary-1 bg-opacity-60 laptop:bg-transparent laptop:items-center"
  >
    <h1 class="flex items-center justify-start laptop:flex-col laptop:pt-10 laptop:items-start">
      <Logo class="text-natural-white" />
      <h2 class="text-natural-white hidden laptop:block laptop:mt-6 laptop:mb-2">@{{ $store.getters.roomName }}</h2>
    </h1>
    <div class="flex justify-between items-center">
      <Marquee class="mt-5 laptop:mt-0 flex-auto" />
      <!-- absolute base on <header> -->
      <nav class="absolute top-8 right-8 laptop:static">
        <ul class="justify-end flex">
          <li>
            <button type="button" class="px-3 laptop:py-2 laptop:px-4" @click="activeSideDrawerHandler('Search')">
              <IconSearch />
            </button>
          </li>
          <li>
            <button
              type="button"
              class="flex text-natural-white laptop:bg-tertiary-1 px-3 laptop:py-2 laptop:px-4 laptop:border laptop:border-natural-gray2"
              @click="activeSideDrawerHandler('AddFromStreamingService')"
            >
              <IconPlus />
              <label class="hidden ml-3 laptop:inline">Add from Spotify</label>
            </button>
          </li>
          <li>
            <button
              class="flex items-center text-natural-white px-3 laptop:py-2 laptop:px-4"
              type="button"
              @click="activeSideDrawerHandler('Personal')"
            >
              <IconPerson />
              <label class="hidden ml-3 laptop:inline">{{ $store.getters.userName }}</label>
            </button>
          </li>
        </ul>
      </nav>

      <FeedbackAlert class="absolute inset-x-1/4 top-16" />
    </div>
  </header>
</template>
