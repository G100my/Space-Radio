<script setup lang="ts">
import { routeMap } from '@/constant'
import { useRouter } from 'vue-router'
import { PKCE } from 'shared'
import { generateAuthParams } from 'shared'
import { auth } from '@/plugins/firebase'
import { useHostStore } from '@/stores'
import { registerSW } from '@/utils'
import { ref } from 'vue'

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

function requestPermission() {
  console.warn('Requesting permission...')
  Notification.requestPermission().then(permission => {
    if (permission === 'granted') {
      console.warn('Notification permission granted.')
      registerSW().then(messagingToken => {
        hostStore.updateMessagingToken(messagingToken)
      })
    } else if (permission === 'denied') {
      console.error('Notification permission denied.')
    } else if (permission === 'default') {
      console.warn('Notification permission dismissed.')
    }
  })
}
const disableNotificationBtn = ref(true)
const notificationPermissionState = ref('')
if ('serviceWorker' in navigator) {
  switch (Notification.permission) {
    case 'default':
      notificationPermissionState.value = '等待授權'
      disableNotificationBtn.value = false
      break
    case 'denied':
      notificationPermissionState.value = '已拒絕'
      disableNotificationBtn.value = true
      break
    case 'granted':
      notificationPermissionState.value = '已授權'
      disableNotificationBtn.value = true
      break
  }
} else {
  notificationPermissionState.value = 'Not supported'
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
    <div>
      <div>
        <p>開啟通知，如果有人點歌的話，手機會跳出通知。</p>
        <p>如果要關閉，請清除瀏覽器對這個網址的資料。</p>
        <p>如果已經設定為拒絕，要再開啟請至瀏覽器設定操作</p>
        <p>
          目前瀏覽器通知狀態：<span class="text-primary">{{ notificationPermissionState }}</span>
        </p>
      </div>
      <button
        type="button"
        :disabled="disableNotificationBtn"
        class="text-natural-white bg-primary mt-4 w-full rounded-full py-2 text-center text-2xl disabled:bg-gray-500"
        @click="requestPermission"
      >
        開啟通知權限
      </button>
    </div>
  </section>
</template>
