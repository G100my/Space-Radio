<script>
import IconPlus from '@/assets/icons/icon-plus.svg'
import IconArrowUp from '@/assets/icons/icon-arrow-up.svg'
import BaseMarquee from '../base/BaseMarquee.vue'

export default {
  components: { BaseMarquee, IconPlus, IconArrowUp },
  props: {
    id: {
      type: String,
      default: 'infinity',
    },
    list: {
      type: Array,
      required: true,
    },
    selectable: {
      type: Boolean,
      default: false,
    },
    selectMode: {
      type: Boolean,
      default: false,
    },
    selectHandler: {
      type: Function,
      default: () => {},
    },
  },
}
</script>
<template>
  <ul :id="id" class="space-y-4 overflow-y-auto">
    <li v-for="track in list" :key="track.id" class="bg-tertiary-1 bg-opacity-60 rounded-10 flex gap-x-2 py-3 px-4">
      <div class="flex-shrink-0 w-11 h-11 md:w-16 md:h-16 object-cover object-center flex justify-center items-center">
        <img
          v-show="!selectMode"
          class="w-full object-cover object-center"
          :src="track.album.coverUrl"
          :alt="track.album.name"
        />
        <input
          v-if="selectable"
          v-show="selectMode"
          type="checkbox"
          @change="selectHandler($event.target.value, track.id, track.name)"
        />
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
      <div class="flex items-center">
        <button
          class="btn-tertiary"
          type="button"
          @click="$store.dispatch('add', { id: track.id, track_name: track.name })"
        >
          <IconPlus />
        </button>
        <button
          class="btn-tertiary"
          type="button"
          @click="$store.dispatch('jumpIn', { id: track.id, track_name: track.name })"
        >
          <IconArrowUp />
        </button>
      </div>
    </li>
  </ul>
</template>
