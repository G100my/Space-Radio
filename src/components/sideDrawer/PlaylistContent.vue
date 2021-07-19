<script>
import { computed, reactive, ref } from '@vue/runtime-core'
import { useStore } from 'vuex'
import IconPlus from '@/assets/icons/icon-plus.svg'
import IconArrowUp from '@/assets/icons/icon-arrow-up.svg'
import BaseMarquee from '../base/BaseMarquee.vue'

export default {
  name: 'PlaylistContent',
  components: { BaseMarquee, IconPlus, IconArrowUp },
  setup() {
    const store = useStore()

    const selectMode = ref(false)
    const selectedId = reactive(new Set())

    function checkboxHandler(id) {
      if (selectedId.has(id)) {
        selectedId.delete(id)
      } else {
        selectedId.add(id)
      }
    }

    function addHandler() {
      console.log('bububu~~')
      console.log(selectedId)
      selectedId.clear()
    }

    function clearHandler() {
      selectedId.clear()
      selectMode.value = false
    }
    return {
      listName: computed(() => store.getters.listName),
      list: computed(() => store.getters.chosenList),
      selectMode,
      selectedId,
      checkboxHandler,
      addHandler,
      clearHandler,
    }
  },
}
</script>
<template>
  <div class="flex flex-col h-full">
    <header>
      <div v-show="!selectMode" class="flex justify-between">
        <h2 class="text-natural-gray1 text-subtitle laptop:text-header">{{ listName }}</h2>
        <button class="btn-primary text-tertiary-1 text-opacity-80" type="button" @click="selectMode = true">
          Select
        </button>
      </div>
      <div v-show="selectMode" class="flex gap-x-2.5 items-center">
        <p class="text-body font-bold text-natural-gray2">{{ selectedId.size }} selected</p>
        <button type="button" class="ml-auto btn-primary" @click="addHandler">Add</button>
        <button type="button" class="btn-secondary" @click="clearHandler">Cancel</button>
      </div>
    </header>
    <ul class="flex-1 mt-7 w-full space-y-4 overflow-y-auto">
      <li
        v-for="track in list"
        :key="track.id"
        class="bg-tertiary-1 bg-opacity-60 rounded-[10px] flex gap-x-2 py-3 px-4"
      >
        <div
          class="flex-shrink-0 w-11 h-11 md:w-16 md:h-16 object-cover object-center flex justify-center items-center"
        >
          <img
            v-show="!selectMode"
            class="w-full object-cover object-center"
            :src="track.album.coverUrl"
            :alt="track.album.name"
          />
          <input v-if="selectMode" type="checkbox" @change="checkboxHandler(track.id)" />
        </div>
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
