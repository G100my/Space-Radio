<script>
import IconPending from '@/assets/icons/icon-spinner-loader.svg'
import IconEdit from '@/assets/icons/icon/edit.svg'
import IconArrowUp from '@/assets/icons/icon-arrow-up.svg'
import IconArrowDown from '@/assets/icons/icon-arrow-down.svg'
import IconRemove from '@/assets/icons/icon-remove.svg'
import IconMore from '@/assets/icons/icon-more.svg'

import { mapGetters } from 'vuex'
import BaseMarquee from '../base/BaseMarquee.vue'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'

export default {
  components: {
    IconPending,
    IconEdit,
    IconArrowUp,
    IconArrowDown,
    IconRemove,
    IconMore,
    BaseMarquee,
    Menu,
    MenuButton,
    MenuItems,
    MenuItem,
  },
  emits: ['activeNoteDialog'],
  data() {
    return {
      isMenuPositionUp: false,
    }
  },
  computed: {
    ...mapGetters(['trackData', 'totalQueue', 'normalQueue', 'urgentQueue', 'pendingQueue', 'userId']),
  },
  methods: {
    remove(orderKey, level) {
      this.$store.dispatch(`${level}Remove`, orderKey)
    },
    getImageUrl(track) {
      const imagesArray = track.album.images
      const imageLastObject = imagesArray[imagesArray.length - 1]
      // fixme 忘記當初是抓最大張圖片還是最小張
      return imageLastObject ? imageLastObject.url : null
    },
    getOrderer(orderKey) {
      if (this.normalQueue[orderKey]) return this.normalQueue[orderKey].orderer_name
      else if (this.urgentQueue[orderKey]) return this.urgentQueue[orderKey].orderer_name
      else return this.pendingQueue[orderKey].orderer_name
    },
    menuPositionHandler(event, openState) {
      if (!openState && event.clientY > (window.innerHeight * 2) / 3) {
        this.isMenuPositionUp = true
      } else {
        this.isMenuPositionUp = false
      }
    },
    checkLevel(level, key) {
      switch (level) {
        case 'normal':
          return Boolean(this.normalQueue[key])
        case 'urgent':
          return Boolean(this.urgentQueue[key])
        case 'pending':
          if (this.pendingQueue) return Boolean(this.pendingQueue[key])
          else return false
        default:
          return false
      }
    },
  },
}
</script>
<template>
  <div class="h-full overflow-y-auto flex flex-col laptop:pb-10">
    <header class="flex justify-between items-center pb-6">
      <h3 class="text-natural-gray2 text-2xl laptop:text-header font-semibold">Next</h3>
      <img src="@/assets/images/Spotify_Logo_CMYK_Green.png" alt="Spotify" class="w-20" />
    </header>
    <ul class="flex-1 overflow-y-auto space-y-2">
      <li
        v-for="(key, index) in Object.keys(totalQueue)"
        :key="key"
        class="_tracks flex items-center gap-x-3 p-3 bg-tertiary-1 bg-opacity-60 rounded-10 hover:bg-opacity-100"
      >
        <div class="flex-shrink-0 w-10 flex justify-center items-center">
          <span v-if="checkLevel('normal', key)" class="text-body font-bold text-natural-gray3">{{ index }}</span>
          <IconArrowUp v-else-if="checkLevel('urgent', key)" class="arrow-up" />
          <IconPending v-else class="pending" />
        </div>

        <div class="flex-shrink-0 flex justify-center items-center">
          <img class="w-11 h-11" :src="getImageUrl(trackData[key])" alt="album photo" />
        </div>

        <div class="_info_1 overflow-hidden w-full">
          <BaseMarquee class="text-natural-gray1 font-bold text-xs md:text-base" :text="trackData[key].name" />
          <BaseMarquee class="text-primary text-xs md:text-base" :text="getOrderer(key)" />
        </div>

        <div class="_info_2 hidden md:block">
          <BaseMarquee class="text-natural-gray1">
            <a :href="trackData[key].external_urls.spotify" target="_blank">
              {{ trackData[key].album.name }}
            </a>
          </BaseMarquee>
          <BaseMarquee class="text-natural-gray1">
            <a
              v-for="artist in trackData[key].artists"
              :key="artist.name"
              :href="artist.external_urls.spotify"
              target="_blank"
              >{{ artist.name }}</a
            >
          </BaseMarquee>
        </div>

        <template v-if="userId === totalQueue[key].order_id">
        <div class="w-[146px] hidden xs:flex justify-end space-x-3">
          <template v-if="checkLevel('urgent', key)">
            <button class="btn-tertiary" type="button" @click="$store.dispatch('urgentEdit', key)">
              <IconEdit />
            </button>
            <button class="btn-tertiary" type="button" @click="$store.dispatch('urgent2normal', key)">
              <IconArrowDown />
            </button>
          </template>
          <button
            v-if="checkLevel('normal', key)"
            class="btn-tertiary"
            type="button"
            @click="$store.dispatch('normal2urgent', key)"
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

        <Menu
          v-slot="{ open }"
          as="div"
          class="cursor-pointer self-stretch relative xs:hidden cursor-pointer self-stretch"
        >
          <MenuButton class="btn-tertiary" type="button" @click="menuPositionHandler($event, open)">
            <IconMore />
          </MenuButton>
          <transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="transform scale-95 opacity-0"
            enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-75 ease-out"
            leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0"
          >
            <MenuItems
              :class="{ 'top-0 -translate-y-full': isMenuPositionUp }"
              class="absolute right-0 bg-tertiary-1 py-2 px-5 z-20 rounded-10 space-y-4"
            >
              <template v-if="checkLevel('urgent', key)">
                <MenuItem v-slot="{ active }">
                  <li :class="{ active }" class="_menu-item" @click="editNote(key)">
                    <IconEdit />
                    <span>Edit order</span>
                  </li>
                </MenuItem>
                <MenuItem v-slot="{ active }">
                  <li :class="{ active }" class="_menu-item" @click="urgent2normal(key)">
                    <IconArrowDown />
                    <span>Cancel order</span>
                  </li>
                </MenuItem>
              </template>

              <MenuItem v-if="checkLevel('normal', key)" v-slot="{ active }">
                <li :class="{ active }" class="_menu-item" @click="normal2urgent(key)">
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
          </transition>
        </Menu>
        </template>
        <div v-else class="w-[146px] hidden xs:block" />
      </li>
    </ul>
  </div>
</template>
<style lang="postcss">
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
  @apply whitespace-nowrap flex text-natural-white gap-x-2;

  &.active {
    @apply text-primary;
    path {
      @apply fill-current;
    }
  }
}
</style>
