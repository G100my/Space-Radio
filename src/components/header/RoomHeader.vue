<script lang="ts">
import { ref } from 'vue'
import Marquee from '@/components/header/Marquee.vue'
import IconSearch from '@/assets/icons/icon-search.svg?component'
import IconPerson from '@/assets/icons/icon/profile.svg?component'
import IconPlus from '@/assets/icons/icon-plus.svg?component'
import FeedbackAlert from './FeedbackAlert.vue'
import { useI18n } from 'vue-i18n'
import BaseAlert from '../base/BaseAlert.vue'
import { LightningBoltIcon } from '@heroicons/vue/outline'
import { usePersonalStore, useRoomBasicStore } from '@/store'

export type ComponentName = 'Recommendation' | 'Search' | 'Personal' | 'AddFromStreamingService'

export default {
  components: {
    IconSearch,
    // eslint-disable-next-line vue/no-reserved-component-names
    Marquee,
    IconPerson,
    IconPlus,
    FeedbackAlert,
    BaseAlert,
    LightningBoltIcon,
  },
  emits: ['activeSideDrawer'],
  setup(_props, { emit }) {
    const isSearchActive = ref(false)
    function activeSideDrawerHandler(componentName: ComponentName) {
      emit('activeSideDrawer', componentName)
    }
    const roomBasic = useRoomBasicStore()
    const isShow = ref(false)
    function copyLinkHandler() {
      console.log(navigator)
      const inviteUrl = `${location.origin}/#/doorscope/${roomBasic.room_key}`
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
      personalStore: usePersonalStore(),
      roomBasic,
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
        <span>@{{ roomBasic.room_name }}</span>
        <span>#{{ roomBasic.room_key }}</span>
        <BaseAlert
          class="absolute bottom-0 right-0 translate-y-full"
          :show="isShow"
          closeButton
          :title="t('copied')"
          :contentText="t('invite_your_friend')"
        />
      </h2>
    </h1>
    <div class="relative flex flex-col flex-wrap items-end justify-between gap-2 laptop:flex-row laptop:items-center">
      <div class="laptop::w-auto mt-5 flex-auto laptop:mt-0">
        <Marquee />
      </div>
      <!-- absolute base on <header> -->
      <nav class="w-fit">
        <ul class="flex justify-end gap-2">
          <li>
            <button type="button" class="px-3 laptop:py-2 laptop:px-4" @click="activeSideDrawerHandler('Search')">
              <IconSearch />
            </button>
          </li>
          <li>
            <button
              type="button"
              class="btn-response min-h-0"
              @click="activeSideDrawerHandler('AddFromStreamingService')"
            >
              <IconPlus />
              <label class="ml-3 hidden whitespace-nowrap laptop:inline">{{ t('add_from_spotify') }}</label>
            </button>
          </li>
          <li>
            <button type="button" class="btn-response min-h-0" @click="activeSideDrawerHandler('Recommendation')">
              <LightningBoltIcon class="h-full w-6" />
              <label class="ml-3 hidden whitespace-nowrap laptop:inline">{{ t('add_from_recommendation') }}</label>
            </button>
          </li>
          <li>
            <button
              class="flex items-center px-3 text-natural-white laptop:py-2 laptop:px-4"
              type="button"
              @click="activeSideDrawerHandler('Personal')"
            >
              <IconPerson />
              <label class="ml-3 hidden laptop:inline">{{ personalStore.display_name }}</label>
            </button>
          </li>
        </ul>
      </nav>

      <FeedbackAlert class="absolute inset-x-1/4 top-16" />
    </div>
  </header>
</template>
