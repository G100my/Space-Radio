<script lang="ts">
import { ref } from 'vue'
import Marquee from '@/components/header/Marquee.vue'
import IconSearch from '@/assets/icons/icon-search.svg?component'
import IconPerson from '@/assets/icons/icon/profile.svg?component'
import IconPlus from '@/assets/icons/icon-plus.svg?component'
import FeedbackAlert from './FeedbackAlert.vue'
import { useI18n } from 'vue-i18n'
import BaseAlert from '../base/BaseAlert.vue'
import { LightBulbIcon } from '@heroicons/vue/24/outline'
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
    LightBulbIcon,
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
    class="header bg-tertiary-1 laptop:flex-row laptop:items-center laptop:bg-transparent laptop:p-0 relative z-10 flex-col bg-opacity-60 px-8 py-5"
  >
    <h1 class="laptop:flex-col laptop:items-start laptop:pt-10 flex items-center justify-start">
      <img
        src="@/assets/images/logo-large.png"
        class="text-natural-white cursor-pointer"
        @click="$router.push({ name: 'Hall' })"
      />
      <h2
        class="text-natural-white laptop:mt-6 laptop:mb-2 laptop:flex relative hidden w-full justify-between"
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
    <div class="laptop:flex-row laptop:items-center relative flex flex-col flex-wrap items-end justify-between gap-2">
      <div class="laptop::w-auto laptop:mt-0 mt-5 flex-auto">
        <Marquee />
      </div>
      <!-- absolute base on <header> -->
      <nav class="w-fit">
        <ul class="flex justify-end gap-2">
          <li>
            <button type="button" class="laptop:py-2 laptop:px-4 px-3" @click="activeSideDrawerHandler('Search')">
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
              <label class="laptop:inline ml-3 hidden whitespace-nowrap">{{ t('add_from_spotify') }}</label>
            </button>
          </li>
          <li>
            <button type="button" class="btn-response min-h-0" @click="activeSideDrawerHandler('Recommendation')">
              <LightBulbIcon class="h-full w-6" />
              <label class="laptop:inline ml-3 hidden whitespace-nowrap">{{ t('add_from_recommendation') }}</label>
            </button>
          </li>
          <li>
            <button
              class="text-natural-white laptop:py-2 laptop:px-4 flex items-center px-3"
              type="button"
              @click="activeSideDrawerHandler('Personal')"
            >
              <IconPerson />
              <label class="laptop:inline ml-3 hidden">{{ personalStore.display_name }}</label>
            </button>
          </li>
        </ul>
      </nav>

      <FeedbackAlert class="absolute inset-x-1/4 top-16" />
    </div>
  </header>
</template>
