<script lang="ts">
import IconPending from '@/assets/icons/icon-spinner-loader.svg?component'
import IconEdit from '@/assets/icons/icon/edit.svg?component'
import IconArrowUp from '@/assets/icons/icon-arrow-up.svg?component'
import IconArrowDown from '@/assets/icons/icon-arrow-down.svg?component'
import IconRemove from '@/assets/icons/icon-remove.svg?component'
import IconMore from '@/assets/icons/icon-more.svg?component'

import { Marquee } from 'shared'
import { Menu as HMenu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { computed, ref } from 'vue'
import { usePersonalStore } from '@/store'
import { useNoteStore, useQueueStore } from '@/store'

export default {
  components: {
    IconPending,
    IconEdit,
    IconArrowUp,
    IconArrowDown,
    IconRemove,
    IconMore,
    Marquee,
    HMenu,
    MenuButton,
    MenuItems,
    MenuItem,
  },
  emits: ['activeNoteDialog'],
  setup(_props, context) {
    const personalStore = usePersonalStore()
    const userId = computed(() => personalStore.id)

    const queueStore = useQueueStore()
    const isMenuPositionUp = ref(false)
    const trackData = computed(() => queueStore.trackData)
    const totalQueue = computed(() => queueStore.totalQueue)
    const normalQueue = computed(() => queueStore.normal_queue)
    const urgentQueue = computed(() => queueStore.urgent_queue)
    const pendingQueue = computed(() => queueStore.pending_queue)

    function remove(orderKey: string, level: 'normal' | 'urgent') {
      queueStore[`${level}Remove`](orderKey)
    }
    function getImageUrl(track: SpotifyApi.SingleTrackResponse) {
      const imagesArray = track.album.images
      const imageLastObject = imagesArray[imagesArray.length - 1]
      return imageLastObject ? imageLastObject.url : undefined
    }
    function getOrderer(orderKey: string) {
      if (normalQueue.value[orderKey]) return normalQueue.value[orderKey].orderer_name
      else if (urgentQueue.value[orderKey]) return urgentQueue.value[orderKey].orderer_name
      else if (pendingQueue.value[orderKey]) return pendingQueue.value[orderKey].orderer_name
    }
    function menuPositionHandler(event: MouseEvent, openState: boolean) {
      if (!openState && event.clientY > (window.innerHeight * 2) / 3) {
        isMenuPositionUp.value = true
      } else {
        isMenuPositionUp.value = false
      }
    }
    function checkLevel(level: 'normal' | 'urgent' | 'pending', key: string) {
      switch (level) {
        case 'normal':
          return Boolean(normalQueue.value[key])
        case 'urgent':
          return Boolean(urgentQueue.value[key])
        case 'pending':
          if (pendingQueue.value) return Boolean(pendingQueue.value[key])
          else return false
        default:
          return false
      }
    }
    function editNote(orderKey: string) {
      const trackNameForLog = trackData.value[orderKey].name
      const submitFunction = () => {
        queueStore.urgentEdit(orderKey)
      }
      context.emit('activeNoteDialog', { orderKey, trackNameForLog, submitFunction })
    }
    return {
      isMenuPositionUp,
      remove,
      getImageUrl,
      getOrderer,
      menuPositionHandler,
      checkLevel,
      editNote,

      totalQueue,
      userId,
      trackData,
      queueStore,
      noteStore: useNoteStore(),
    }
  },
}
</script>
<template>
  <div class="laptop:pb-10 flex h-full flex-col overflow-y-auto">
    <header class="flex items-center justify-between pb-6">
      <h3 class="text-natural-gray2 laptop:text-header text-2xl font-semibold">Next</h3>
      <img src="@/assets/images/Spotify_Logo_CMYK_Green.png" alt="Spotify" class="w-20" />
    </header>
    <transition-group name="queue" tag="ul" class="relative flex-1 space-y-2 overflow-y-auto">
      <li
        v-for="(key, index) in Object.keys(totalQueue)"
        :key="key"
        class="_tracks rounded-10 bg-tertiary-1 flex items-center gap-x-3 bg-opacity-60 p-3 hover:bg-opacity-100"
      >
        <div class="flex w-10 flex-shrink-0 items-center justify-center">
          <span v-if="checkLevel('normal', key)" class="text-body text-natural-gray3 font-bold">{{ index }}</span>
          <IconArrowUp v-else-if="checkLevel('urgent', key)" class="arrow-up" />
          <IconPending v-else class="pending" />
        </div>

        <div class="flex flex-shrink-0 items-center justify-center">
          <img class="h-11 w-11" :src="getImageUrl(trackData[key])" alt="album photo" />
        </div>

        <div class="_info_1 w-full overflow-hidden">
          <Marquee class="text-natural-gray1 text-xs font-bold md:text-base" :text="trackData[key].name" />
          <Marquee class="text-primary text-xs md:text-base" :text="getOrderer(key)" />
        </div>

        <div class="_info_2 hidden md:block">
          <Marquee class="text-natural-gray1">
            <a :href="trackData[key].external_urls.spotify" target="_blank">
              {{ trackData[key].album.name }}
            </a>
          </Marquee>
          <Marquee class="text-natural-gray1">
            <a
              v-for="artist in trackData[key].artists"
              :key="artist.name"
              :href="artist.external_urls.spotify"
              target="_blank"
              >{{ artist.name }}</a
            >
          </Marquee>
        </div>

        <template v-if="userId === totalQueue[key].orderer_id">
          <div class="xs:flex hidden w-[146px] justify-end space-x-3">
            <template v-if="checkLevel('urgent', key)">
              <button class="btn-tertiary" type="button" @click="queueStore.urgentEdit(key)">
                <IconEdit />
              </button>
              <button class="btn-tertiary" type="button" @click="queueStore.urgent2normal(key)">
                <IconArrowDown />
              </button>
            </template>
            <button
              v-if="checkLevel('normal', key)"
              class="btn-tertiary"
              type="button"
              @click="queueStore.normal2urgent(key)"
            >
              <IconArrowUp />
            </button>
            <button
              v-if="!checkLevel('pending', key)"
              class="btn-tertiary"
              type="button"
              @click="remove(key, checkLevel('normal', key) ? 'normal' : 'urgent')"
            >
              <IconRemove />
            </button>
          </div>

          <HMenu v-slot="{ open }" as="div" class="xs:hidden relative cursor-pointer self-stretch">
            <MenuButton class="btn-tertiary" type="button" @click="menuPositionHandler($event, open)">
              <IconMore />
            </MenuButton>
            <Transition
              enterActiveClass="transition duration-150 ease-out"
              enterFromClass="transform scale-95 opacity-0"
              enterToClass="transform scale-100 opacity-100"
              leaveActiveClass="transition duration-75 ease-out"
              leaveFromClass="transform scale-100 opacity-100"
              leaveToClass="transform scale-95 opacity-0"
            >
              <MenuItems
                :class="{ 'top-0 -translate-y-full': isMenuPositionUp }"
                class="rounded-10 bg-tertiary-1 absolute right-0 z-20 space-y-4 px-5 py-2"
              >
                <template v-if="checkLevel('urgent', key)">
                  <MenuItem v-slot="{ active }">
                    <li :class="{ active }" class="_menu-item" @click="editNote(key)">
                      <IconEdit />
                      <span>Edit order</span>
                    </li>
                  </MenuItem>
                  <MenuItem v-slot="{ active }">
                    <li :class="{ active }" class="_menu-item" @click="queueStore.urgent2normal(key)">
                      <IconArrowDown />
                      <span>Cancel order</span>
                    </li>
                  </MenuItem>
                </template>

                <MenuItem v-if="checkLevel('normal', key)" v-slot="{ active }">
                  <li :class="{ active }" class="_menu-item" @click="queueStore.normal2urgent(key)">
                    <IconArrowUp />
                    <span>Order</span>
                  </li>
                </MenuItem>

                <MenuItem v-if="!checkLevel('pending', key)" v-slot="{ active }">
                  <li
                    :class="{ active }"
                    class="_menu-item"
                    @click="remove(key, checkLevel('normal', key) ? 'normal' : 'urgent')"
                  >
                    <IconRemove />
                    <span>Delete song</span>
                  </li>
                </MenuItem>
              </MenuItems>
            </Transition>
          </HMenu>
        </template>
        <div v-else class="xs:block hidden w-[146px]" />
      </li>
    </transition-group>
  </div>
</template>
<style>
._info_1,
._info_2 {
  @apply min-w-0;
}
._info_1 {
  flex: 2;
}
._info_2 {
  flex: 1;
}

._menu-item {
  @apply text-natural-white flex gap-x-2 whitespace-nowrap;
}
._menu-item.active {
  @apply text-primary;
}
._menu-item.active path {
  @apply fill-current;
}

.queue-move {
  @apply transition-transform delay-200 duration-300;
}
.queue-leave-active {
  @apply absolute w-full transition-opacity duration-300;
}
.queue-enter-from,
.queue-leave-to {
  @apply opacity-0;
}
</style>
