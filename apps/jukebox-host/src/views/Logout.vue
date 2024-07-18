<script setup lang="ts">
import { routeMap } from '@/constant'
import { usePersonalStore } from '@/stores'
import { useRouter } from 'vue-router'

const personalStore = usePersonalStore()
const router = useRouter()

function handleLogout() {
  personalStore.clear()
  router.push({ name: routeMap.Index })
}
</script>

<template>
  <section>
    <div class="p-5">
      <p>
        這並不會清除掉伺服器的紀錄，只是把瀏覽器裡面的登入資訊清除，再次登入後會重新複寫賦予給伺服器上的 spotify 權限。
      </p>
      <p>用在如果客人沒辦法點歌時的重新登入用的</p>
    </div>
    <button
      type="button"
      @click="handleLogout"
      class="text-natural-white bg-system-error1 w-full rounded-full py-3 text-center text-4xl"
    >
      Loggout
    </button>
  </section>
</template>
