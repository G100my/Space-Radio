<script>
import { computed, reactive, ref, toRaw } from '@vue/runtime-core'
import { useStore } from 'vuex'
import IconSpinnerLoader from '@/assets/icons/icon-spinner-loader.svg'
import TrackListContainer from './TrackListContainer.vue'
import { useInfinityScroll } from '@/composables/useInfinityScroll'

export default {
  name: 'PlaylistContent',
  components: { IconSpinnerLoader, TrackListContainer },
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

    const { isloading } = useInfinityScroll({
      id: 'infinity_playlist',
      nextURL: next,
      fetchCallback: () => store.dispatch('fetchOffset'),
      onUnmountedCallback: () => store.commit('chosenList', []),
      fetchFirstCallback: () => store.dispatch('fetchFirst'),
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
      isloading,
    }
  },
}
</script>
<template>
  <div class="flex h-full flex-col">
    <header class="relative">
      <div :class="{ invisible: selectMode }" class="flex items-center justify-between">
        <h2 class="text-subtitle text-natural-gray1 laptop:text-header laptop:leading-tight">{{ listName }}</h2>
        <button class="btn-primary ml-3 text-tertiary-1 text-opacity-80" type="button" @click="selectMode = true">
          Select
        </button>
      </div>
      <div v-show="selectMode" class="absolute inset-0 flex items-center gap-x-2.5">
        <p class="text-body font-bold text-natural-gray2">{{ idSet.size }} selected</p>
        <button type="button" class="btn-primary ml-auto" @click="addMultipleHandler">Add</button>
        <button type="button" class="btn-secondary" @click="cancelHandler">Cancel</button>
      </div>
    </header>
    <div class="mt-5 flex items-center gap-x-1">
      <p class="mr-auto font-bold text-natural-gray2">
        <span class="mx-2">{{ list.length }}{{ listTotal ? ` / ${listTotal}` : '' }}</span>
        <span>results</span>
      </p>
      <IconSpinnerLoader v-show="isloading" class="mx-2 inline-block animate-spin text-natural-gray2" />
    </div>

    <TrackListContainer
      id="infinity_playlist"
      :list="list"
      selectable
      :selectMode="selectMode"
      :selectHandler="checkboxHandler"
      class="mt-7 h-0 w-full flex-auto"
    />
  </div>
</template>
