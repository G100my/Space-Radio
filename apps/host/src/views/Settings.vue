<script setup lang="ts">
import { routeMap } from '@/constant'
import { useRouter } from 'vue-router'
import { PKCE } from 'shared'
import { generateAuthParams } from 'shared'
import { auth } from '@/plugins/firebase'
import { useHostStore } from '@/stores'
import { ref } from 'vue'

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
const subscribeStatus = ref(await hostStore.checkSubscribeStatus())
function handleSubscribe() {
  hostStore.recordFCMtoken().then(() => {
    subscribeStatus.value = true
  })
}
function handleCancelSubscribe() {
  hostStore.removeFCMtoken().then(() => {
    subscribeStatus.value = false
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
      <div>
        <p>通知功能：如果有人點歌的話，瀏覽器會跳出通知。</p>
        <p>
          瀏覽器通知設定：{{
            notificationState === 'default' ? '未設定' : notificationState === 'denied' ? '已拒絕' : '已授權'
          }}
        </p>
        <p>通知啟用狀態：{{ subscribeStatus ? '已啟用' : '未啟用' }}</p>
      </div>

      <template v-if="notificationState === 'denied'">
        <p>瀏覽器通知狀態已經設定為"拒絕"，要開啟通知功能請至瀏覽器設定操作</p>
      </template>

      <template v-else>
        <button
          type="button"
          class="text-natural-white mt-4 w-full rounded-full py-2 text-center text-2xl disabled:bg-gray-500"
          :class="subscribeStatus ? 'bg-slate-600' : 'bg-primary'"
          @click="subscribeStatus ? handleCancelSubscribe() : handleSubscribe()"
        >
          {{ subscribeStatus ? '關閉通知' : '開啟通知' }}
        </button>
      </template>
    </div>
  </section>
</template>
