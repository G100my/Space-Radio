<script setup lang="ts">
import { routeMap } from '@/constant'
import { useRouter } from 'vue-router'
import { PKCE } from 'shared'
import { generateAuthParams } from 'shared'
import { auth } from '@/plugins/firebase'
import { useHostStore } from '@/stores'

const router = useRouter()
const hostStore = useHostStore()

function handleFirebaseAuthLogout() {
  auth.signOut().then(() => {
    router.push({ name: routeMap.Index })
    hostStore.$reset()
  })
}
function handleSpotifyAuth() {
  PKCE(generateAuthParams(routeMap.Queue))
}
</script>

<template>
  <section class="flex flex-col justify-center gap-20">
    <div>
      <div>
        <p class="text-center">重新登入 spotify，並且授權給伺服器，用在遠端伺服器上的權限過期失效時。</p>
      </div>
      <button
        type="button"
        @click="handleSpotifyAuth"
        class="text-natural-white bg-primary mt-4 w-full rounded-full py-2 text-center text-2xl"
      >
        Refresh Token
      </button>
    </div>
    <div>
      <div>
        <p class="text-center">登出 Firebase Auth，並且回到登入頁。</p>
      </div>
      <button
        type="button"
        @click="handleFirebaseAuthLogout"
        class="text-natural-white bg-primary mt-4 w-full rounded-full py-2 text-center text-2xl"
      >
        Logout
      </button>
    </div>
  </section>
</template>
