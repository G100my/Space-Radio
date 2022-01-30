<script>
import { ref } from 'vue'
import Marquee from '@/components/header/Marquee.vue'
import IconSearch from '@/assets/icons/icon-search.svg'
import IconPerson from '@/assets/icons/icon/profile.svg'
import IconPlus from '@/assets/icons/icon-plus.svg'
import FeedbackAlert from './FeedbackAlert.vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import BaseAlert from '../base/BaseAlert.vue'

export default {
  components: {
    IconSearch,
    Marquee,
    IconPerson,
    IconPlus,
    FeedbackAlert,
    BaseAlert,
  },
  emits: ['activeSideDrawer'],
  setup(_props, { emit }) {
    const isSearchActive = ref(false)
    function activeSideDrawerHandler(componentName) {
      emit('activeSideDrawer', componentName)
    }
    const store = useStore()
    const isShow = ref(false)
    function copyLinkHandler() {
      console.log(navigator)
      const inviteUrl = `${location.origin}/#/doorscope/${store.getters.roomKey}`
      console.log(inviteUrl)
      navigator.clipboard.writeText(inviteUrl)
      isShow.value = true
      setTimeout(() => {
        isShow.value = false
      }, 3000)
    }
    return {
      t: useI18n().t,
      isSearchActive,
      activeSideDrawerHandler,
      copyLinkHandler,
      isShow,
    }
  },
}
</script>
<template>
  <header
    class="flex-col laptop:flex-row relative header z-10 px-8 py-5 laptop:p-0 bg-tertiary-1 bg-opacity-60 laptop:bg-transparent laptop:items-center"
  >
    <h1 class="flex items-center justify-start laptop:flex-col laptop:pt-10 laptop:items-start">
      <img
        src="@/assets/images/logo-large.png"
        class="text-natural-white cursor-pointer"
        @click="$router.push({ name: 'Hall' })"
      />
      <h2
        class="text-natural-white hidden justify-between w-full laptop:mt-6 laptop:mb-2 laptop:flex relative"
        @click="copyLinkHandler"
      >
        <span>@{{ $store.getters.roomName }}</span>
        <span>#{{ $store.getters.roomKey }}</span>
        <BaseAlert
          class="absolute bottom-0 translate-y-full right-0"
          :show="isShow"
          closeButton
          :title="t('copied')"
          :contentText="t('invite_your_friend')"
        />
      </h2>
    </h1>
    <div class="flex flex-col laptop:flex-row justify-between items-end laptop:items-center relative">
      <Marquee class="mt-5 laptop:mt-0 flex-auto w-full laptop::w-auto" />
      <!-- absolute base on <header> -->
      <nav class="static top-8 right-8 laptop:static">
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
              <label class="hidden ml-3 whitespace-nowrap laptop:inline">{{ t('add_from_spotify') }}</label>
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
<i18n>
en:
  add_from_spotify: Add from Spotify
zh-TW:
  add_from_spotify: 從 Spotify 加入音樂
</i18n>
