<script>
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, toRaw, watch } from '@vue/runtime-core'
import { useStore } from 'vuex'
import IconPlus from '@/assets/icons/icon-plus.svg'
import IconArrowUp from '@/assets/icons/icon-arrow-up.svg'
import IconSpinnerLoader from '@/assets/icons/icon-spinner-loader.svg'
import BaseMarquee from '../base/BaseMarquee.vue'

export default {
  name: 'PlaylistContent',
  components: { BaseMarquee, IconPlus, IconArrowUp, IconSpinnerLoader },
  setup() {
    const store = useStore()
    const listName = computed(() => store.getters.chosenName)
    const selectMode = ref(false)
    const idSet = reactive(new Set())
    const nameSet = new Set()

    function checkboxHandler(value, id, name) {
      if (value && !idSet.has(id)) {
        idSet.add(id)
        nameSet.add(name)
      } else if (!value) {
        idSet.delete(id)
        nameSet.delete(name)
      }
    }

    function addMultipleHandler() {
      store.dispatch('addMultiple', { ids: Array.from(toRaw(idSet)), names: Array.from(nameSet) })
      clearSet()
    }
    function cancelHandler() {
      clearSet()
      selectMode.value = false
    }

    function clearSet() {
      idSet.clear()
      nameSet.clear()
    }
    //

    // first
    store.dispatch('fetchFirst')

    const list = computed(() => store.getters.chosenList)
    const listTotal = computed(() => store.getters.chosenTotal)
    const next = computed(() => store.getters.chosenNext)
    let observer
    let infinityContainer
    let target
    const loadingAnimation = ref(false)

    function nextCallback() {
      loadingAnimation.value = false
      if (next.value) {
        nextTick(() => {
          target = infinityContainer.lastElementChild
          observer.observe(target)
        })
      }
    }
    async function nexthandler() {
      if (target) observer.unobserve(target)
      loadingAnimation.value = true
      await store.dispatch('fetchOffset').then(nextCallback)
    }
    onMounted(() => {
      infinityContainer = document.getElementById('infinity')
      const observerOptions = {
        root: infinityContainer,
        rootMargin: '0px',
        threshold: 0.5,
      }
      const callback = ([entry]) => {
        if (entry.isIntersecting) nexthandler()
      }
      observer = new IntersectionObserver(callback, observerOptions)
    })

    const unwatch = watch(list, () => {
      if (list.value !== 0) {
        nextTick(() => {
          target = infinityContainer.lastElementChild
          if (target) observer.observe(target)
        })
        unwatch()
      }
    })

    onUnmounted(() => {
      store.commit('chosenList', [])
    })
    return {
      listName,
      list,
      listTotal,
      selectMode,
      idSet,
      checkboxHandler,
      addMultipleHandler,
      cancelHandler,
      loadingAnimation,
    }
  },
}
</script>
<template>
  <div class="flex flex-col h-full">
    <header class="relative">
      <div :class="{ invisible: selectMode }" class="flex justify-between items-center">
        <h2 class="text-natural-gray1 text-subtitle laptop:text-header laptop:leading-tight">{{ listName }}</h2>
        <button class="ml-3 btn-primary text-tertiary-1 text-opacity-80" type="button" @click="selectMode = true">
          Select
        </button>
      </div>
      <div v-show="selectMode" class="flex gap-x-2.5 items-center absolute inset-0">
        <p class="text-body font-bold text-natural-gray2">{{ idSet.size }} selected</p>
        <button type="button" class="ml-auto btn-primary" @click="addMultipleHandler">Add</button>
        <button type="button" class="btn-secondary" @click="cancelHandler">Cancel</button>
      </div>
    </header>
    <div class="mt-5 flex gap-x-1 items-baseline">
      <p class="mr-auto text-natural-gray2 font-bold">
        <span class="mx-2">{{ list.length }} / {{ listTotal }}</span>
        <span>results</span>
        <IconSpinnerLoader v-show="loadingAnimation" class="animate-spin inline-block text-natural-gray2 mx-2" />
      </p>
    </div>
    <ul id="infinity" class="flex-1 mt-7 w-full space-y-4 overflow-y-auto">
      <li v-for="track in list" :key="track.id" class="bg-tertiary-1 bg-opacity-60 rounded-10 flex gap-x-2 py-3 px-4">
        <div
          class="flex-shrink-0 w-11 h-11 md:w-16 md:h-16 object-cover object-center flex justify-center items-center"
        >
          <img
            v-show="!selectMode"
            class="w-full object-cover object-center"
            :src="track.album.coverUrl"
            :alt="track.album.name"
          />
          <input
            v-if="selectMode"
            type="checkbox"
            @change="checkboxHandler($event.target.value, track.id, track.name)"
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
  </div>
</template>
