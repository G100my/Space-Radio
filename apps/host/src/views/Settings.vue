<script setup lang="ts">
import { routeMap } from '@/constant'
import { useRouter } from 'vue-router'
import { PKCE } from 'shared'
import { generateAuthParams } from 'shared'
import { auth } from '@/plugins/firebase'
import { useHostStore } from '@/stores'
import { registerSW } from '@/utils'
import { computed, ref } from 'vue'

const router = useRouter()
const hostStore = useHostStore()

function handleFirebaseAuthLogout() {
  auth.signOut().then(() => {
    router.push({ name: routeMap.Index })
    hostStore.$reset()
  })
}

// ---

function handleSpotifyAuth() {
  PKCE(generateAuthParams(routeMap.Queue))
}

// ---

const serviceWorkerSupported = 'serviceWorker' in navigator
const notificationState = ref(Notification.permission)

registerSW()

function requestPermission() {
  console.warn('Requesting permission...')
  registerSW().then(messagingToken => {
    hostStore.updateMessagingToken(messagingToken)
  })
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
    <div v-if="serviceWorkerSupported">
      <template v-if="notificationState === 'default'">
        <div>
          <p>開啟通知，如果有人點歌的話，手機會跳出通知。</p>
          <p class="text-xs text-gray-200">如果要關閉，請清除瀏覽器對這個網址的資料。</p>
          <p class="text-xs text-gray-200">如果已經設定為拒絕，要再開啟請至瀏覽器設定操作</p>
        </div>
        <button
          type="button"
          class="text-natural-white bg-primary mt-4 w-full rounded-full py-2 text-center text-2xl disabled:bg-gray-500"
          @click="requestPermission"
        >
          開啟通知權限
        </button>
      </template>
      <template v-if="notificationState === 'denied'">
        <div>
          <p>瀏覽器通知設定：未啟用</p>
          <p class="text-xs text-gray-200">如果通知設定已經設定為拒絕，要開啟請至瀏覽器設定操作</p>
        </div>
      </template>
      <template v-if="notificationState === 'granted'">
        <div>
          <p>瀏覽器通知設定：已啟用</p>
          <p class="text-xs text-gray-200">如果要關閉，請重置瀏覽器對這個網址的設定。</p>
        </div>
      </template>
    </div>
  </section>
</template>
