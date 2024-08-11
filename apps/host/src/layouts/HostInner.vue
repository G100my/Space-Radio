<script setup lang="ts">
import { routeMap } from '@/constant'
import { type Unsubscribe, onValue } from 'firebase/database'
import { onMounted, onUnmounted } from 'vue'
import { db } from '@/plugins/firebase'
import { ref as databaseRef } from 'firebase/database'
import { useHostStore } from '@/stores'

const hostStore = useHostStore()

let unsubscribes: Unsubscribe[] = []
onMounted(() => {
  unsubscribes.push(
    onValue(databaseRef(db, `${hostStore.hostUid}/queue`), snapshot => {
      hostStore.queue = snapshot.val()
    }),
    onValue(databaseRef(db, `${hostStore.hostUid}/settings`), snapshot => {
      hostStore.settings = snapshot.val()
    }),
    onValue(databaseRef(db, `${hostStore.hostUid}/sites`), snapshot => {
      hostStore.sites = snapshot.val()
    })
  )
})
onUnmounted(() => {
  if (unsubscribes.length) unsubscribes.forEach(unsubscribe => unsubscribe())
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
      <span class="block whitespace-nowrap text-xl">使用者設定</span>
    </RouterLink>
    <RouterLink class="w-full" :to="{ name: routeMap.Settings }">
      <span class="block whitespace-nowrap text-xl">其他設定</span>
    </RouterLink>
  </footer>
</template>
