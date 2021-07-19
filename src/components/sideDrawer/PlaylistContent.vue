<script>
import { computed } from '@vue/runtime-core'
import { useStore } from 'vuex'
import IconPlus from '@/assets/icons/icon-plus.svg'
import IconArrowUp from '@/assets/icons/icon-arrow-up.svg'
import BaseMarquee from '../base/BaseMarquee.vue'

export default {
  name: 'PlaylistContent',
  components: { BaseMarquee, IconPlus, IconArrowUp },
  setup() {
    const store = useStore()
    store.dispatch('getSpotifyListContent', '6SCQjqJptdOf0iN79JT9vA')
    return {
      listName: computed(() => store.getters.listName),
      list: computed(() => store.getters.chosenList),
    }
  },
}
</script>
<template>
  <div class="flex flex-col h-full">
    <header class="flex justify-between">
      <h2 class="text-natural-gray1 text-subtitle laptop:text-header">{{ listName }}</h2>
      <button class="btn-primary text-tertiary-1 text-opacity-80" type="button">Select</button>
    </header>

    <ul class="flex-1 mt-7 w-full space-y-4 overflow-y-auto">
      <li
        v-for="track in list"
        :key="track.id"
        class="bg-tertiary-1 bg-opacity-60 rounded-[10px] flex gap-x-2 py-3 px-4"
      >
        <img
          class="w-11 h-11 md:w-16 md:h-16 object-cover object-center"
          :src="track.album.coverUrl"
          :alt="track.album.name"
        />
        <!-- https://www.w3.org/TR/css-flexbox-1/#min-size-auto -->
        <div class="flex-auto min-w-0">
          <BaseMarquee class="text-natural-white">
            <span>{{ track.name }}</span>
          </BaseMarquee>
          <BaseMarquee class="text-natural-white">
            <span v-for="artist in track.artists" :key="artist.name">{{ artist.name }}</span>
          </BaseMarquee>
        </div>
        <div class="flex">
          <button class="btn-tertiary" type="button"><IconPlus /></button>
          <button class="btn-tertiary" type="button"><IconArrowUp /></button>
        </div>
        <!--  -->
      </li>
    </ul>
  </div>
</template>
