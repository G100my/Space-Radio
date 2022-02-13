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
    class="header relative z-10 flex-col bg-tertiary-1 bg-opacity-60 px-8 py-5 laptop:flex-row laptop:items-center laptop:bg-transparent laptop:p-0"
  >
    <h1 class="flex items-center justify-start laptop:flex-col laptop:items-start laptop:pt-10">
      <img
        src="@/assets/images/logo-large.png"
        class="cursor-pointer text-natural-white"
        @click="$router.push({ name: 'Hall' })"
      />
      <h2
        class="relative hidden w-full justify-between text-natural-white laptop:mt-6 laptop:mb-2 laptop:flex"
        @click="copyLinkHandler"
      >
        <span>@{{ $store.getters.roomName }}</span>
        <span>#{{ $store.getters.roomKey }}</span>
        <BaseAlert
          class="absolute bottom-0 right-0 translate-y-full"
          :show="isShow"
          closeButton
          :title="t('copied')"
          :contentText="t('invite_your_friend')"
        />
      </h2>
    </h1>
    <div class="relative flex flex-col items-end justify-between laptop:flex-row laptop:items-center">
      <Marquee class="laptop::w-auto mt-5 w-full flex-auto laptop:mt-0" />
      <!-- absolute base on <header> -->
      <nav class="static top-8 right-8 laptop:static">
        <ul class="flex justify-end">
          <li>
            <button type="button" class="px-3 laptop:py-2 laptop:px-4" @click="activeSideDrawerHandler('Search')">
              <IconSearch />
            </button>
          </li>
          <li>
            <button
              type="button"
              class="flex px-3 text-natural-white laptop:border laptop:border-natural-gray2 laptop:bg-tertiary-1 laptop:py-2 laptop:px-4"
              @click="activeSideDrawerHandler('AddFromStreamingService')"
            >
              <IconPlus />
              <label class="ml-3 hidden whitespace-nowrap laptop:inline">{{ t('add_from_spotify') }}</label>
            </button>
          </li>
          <li>
            <button
              class="flex items-center px-3 text-natural-white laptop:py-2 laptop:px-4"
              type="button"
              @click="activeSideDrawerHandler('Personal')"
            >
              <IconPerson />
              <label class="ml-3 hidden laptop:inline">{{ $store.getters.userName }}</label>
            </button>
          </li>
        </ul>
      </nav>

      <FeedbackAlert class="absolute inset-x-1/4 top-16" />
    </div>
  </header>
</template>
