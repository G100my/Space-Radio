<script lang="ts">
import { computed, reactive, ref, toRaw } from 'vue'
import IconSpinnerLoader from '@/assets/icons/icon-spinner-loader.svg?component'
import TrackListContainer from './TrackListContainer.vue'
import { useInfinityScroll } from 'shared'
import { usePersonalPlaylistStore, useQueueStore } from '@/store'

export default {
  name: 'PlaylistContent',
  components: { IconSpinnerLoader, TrackListContainer },
  setup() {
    const queueStore = useQueueStore()
    const listStore = usePersonalPlaylistStore()
    const listName = computed(() => listStore.chosenName)
    const selectMode = ref(false)
    const idSet = reactive<Set<string>>(new Set())
    const nameSet = new Set<string>()

    function checkboxHandler(value: string, id: string, name: string) {
      if (value && !idSet.has(id)) {
        idSet.add(id)
        nameSet.add(name)
      } else if (!value) {
        idSet.delete(id)
        nameSet.delete(name)
      }
    }

    function addMultipleHandler() {
      queueStore.addMultiple(Array.from(toRaw(idSet)), Array.from(nameSet))
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

    const list = computed(() => listStore.chosenList)
    const listTotal = computed(() => listStore.chosenTotal)
    const next = computed(() => listStore.chosenNext)
    const nextCondition = computed(() => !!next.value)

    const { isLoading } = useInfinityScroll({
      containerID: 'infinity_playlist',
      nextCondition,
      fetchCallback: listStore.fetchOffset,
      onUnmountedCallback: () => (listStore.chosenList = []),
      fetchFirstCallback: listStore.fetchFirst,
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
      isLoading,
    }
  },
}
</script>
<template>
  <div class="flex h-full flex-col">
    <header class="relative">
      <div :class="{ invisible: selectMode }" class="flex items-center justify-between">
        <h2 class="text-subtitle text-natural-gray1 laptop:text-header laptop:leading-tight">{{ listName }}</h2>
        <button class="btn-primary text-tertiary-1 ml-3 text-opacity-80" type="button" @click="selectMode = true">
          Select
        </button>
      </div>
      <div v-show="selectMode" class="absolute inset-0 flex items-center gap-x-2.5">
        <p class="text-body text-natural-gray2 font-bold">{{ idSet.size }} selected</p>
        <button type="button" class="btn-primary ml-auto" @click="addMultipleHandler">Add</button>
        <button type="button" class="btn-secondary" @click="cancelHandler">Cancel</button>
      </div>
    </header>
    <div class="mt-5 flex items-center gap-x-1">
      <p class="text-natural-gray2 mr-auto font-bold">
        <span class="mx-2">{{ list.length }}{{ listTotal ? ` / ${listTotal}` : '' }}</span>
        <span>results</span>
      </p>
      <IconSpinnerLoader v-show="isLoading" class="text-natural-gray2 mx-2 inline-block animate-spin" />
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
