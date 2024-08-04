<script setup lang="ts">
import { routeMap } from '@/constant'
import { type Unsubscribe, onValue } from 'firebase/database'
import { onMounted, onUnmounted } from 'vue'
import { db } from '@/plugins/firebase'
import { ref as databaseRef } from 'firebase/database'
import { useHostStore } from '@/stores'

const hostStore = useHostStore()

let unsubscribe: Unsubscribe
onMounted(() => {
  unsubscribe = onValue(databaseRef(db, `${hostStore.space}/data`), snapshot => {
    const val = snapshot.val()
    console.info('🚀 ~ unsubscribe=onValue ~ val:', val)
    hostStore.queue = val?.queue
    hostStore.settings = val?.settings
    hostStore.sites = val?.sites
  })
})
onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})
</script>
<template>
  <main class="relative w-full flex-1 overflow-hidden p-5">
    <RouterView v-slot="{ Component }">
      <Transition>
        <component :is="Component" />
      </Transition>
    </RouterView>
  </main>
  <footer class="bg-tertiary-2 grid grid-cols-3 border-t-2 border-t-slate-300 px-10 pb-4 pt-3 text-center text-3xl">
    <RouterLink class="w-full" :to="{ name: routeMap.Queue }">
      <span class="block whitespace-nowrap text-xl">Queue</span>
    </RouterLink>
    <RouterLink class="w-full" :to="{ name: routeMap.Sites }">
      <span class="block whitespace-nowrap text-xl">座位設定</span>
    </RouterLink>
    <RouterLink class="w-full" :to="{ name: routeMap.Auth }">
      <span class="block whitespace-nowrap text-xl">Auth</span>
    </RouterLink>
  </footer>
</template>
