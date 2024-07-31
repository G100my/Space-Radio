<script setup lang="ts">
import { routeMap } from '@/constant'
import { usePersonalStore } from '@/stores'
import { useRouter } from 'vue-router'
import { PKCE } from 'shared'
import { generateAuthParams } from 'shared'

const personalStore = usePersonalStore()
const router = useRouter()

function handleLogout() {
  personalStore.clear()
  router.push({ name: routeMap.Index })
}
function handleLogin() {
  PKCE(generateAuthParams(routeMap.Auth))
}
</script>

<template>
  <section>
    <div class="p-5">
      <p>重新登入 spotify，並且重新授權給伺服器，用在如果客人沒辦法點歌時用的</p>
    </div>
    <button
      type="button"
      @click="handleLogin"
      class="text-natural-white bg-secondary w-full rounded-full py-3 text-center text-4xl"
    >
      Refresh Token
    </button>
  </section>
</template>
