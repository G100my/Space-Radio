<script>
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, toRaw } from '@vue/runtime-core'
import { useStore } from 'vuex'
import IconSpinnerLoader from '@/assets/icons/icon-spinner-loader.svg'
import InfinityContainer from './InfinityContainer.vue'

export default {
  name: 'PlaylistContent',
  components: { IconSpinnerLoader, InfinityContainer },
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

    const list = computed(() => store.getters.chosenList)
    const listTotal = computed(() => store.getters.chosenTotal)
    const next = computed(() => store.getters.chosenNext)
    let observer
    let infinityContainer
    let target
    const loadingAnimation = ref(false)

    function observeLastElement() {
      target = infinityContainer.lastElementChild
      if (target) observer.observe(target)
    }
    function nextCallback() {
      loadingAnimation.value = false
      if (next.value) {
        nextTick(observeLastElement)
      }
    }
    function nexthandler() {
      if (target) observer.unobserve(target)
      loadingAnimation.value = true
      store.dispatch('fetchOffset').then(nextCallback)
    }

    store.dispatch('fetchFirst').then(() => {
      nextTick(observeLastElement)
    })

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
    <div class="mt-5 flex gap-x-1 items-center">
      <p class="mr-auto text-natural-gray2 font-bold">
        <span class="mx-2">{{ list.length }}{{ listTotal ? ` / ${listTotal}` : '' }}</span>
        <span>results</span>
      </p>
      <IconSpinnerLoader v-show="loadingAnimation" class="animate-spin inline-block text-natural-gray2 mx-2" />
    </div>

    <InfinityContainer
      :list="list"
      selectable
      :selectMode="selectMode"
      :selectHandler="checkboxHandler"
      class="flex-auto h-0 mt-7 w-full"
    />
  </div>
</template>
