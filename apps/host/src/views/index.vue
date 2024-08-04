<script setup lang="ts">
import { signInWithEmailAndPassword } from 'firebase/auth'
import { ref } from 'vue'
import { auth } from '@/plugins/firebase'
import { useRouter } from 'vue-router'
import { routeMap } from '@/constant'
import { useAlert } from 'shared'

const email = ref('')
const password = ref('')
const router = useRouter()

function handleLogin() {
  signInWithEmailAndPassword(auth, email.value, password.value)
    .then(userCredential => {
      if (import.meta.env.DEV) console.log('🚀 ~ handleLogin ~ userCredential:', userCredential)
      router.push({ name: routeMap.Queue })
    })
    .catch(error => {
      useAlert(error.message).open()
    })
}
</script>
<template>
  <main class="h-full max-w-lg p-5">
    <div>
      <h1 class="text-primary text-center text-5xl">Akijo Radio</h1>
      <section class="mx-4 my-6 space-y-3">
        <h2>注意事項</h2>
        <ol class="list-decimal space-y-3 pl-5">
          <li>
            如果有發生使用者點歌失敗的情形，大多都是spotify
            帳號賦予給伺服器的權限失效（有時間限制），請重新利用這個頁面登入即可。
          </li>
          <li>如果把 All pass 打開，表示所有的座位都可以直接點歌，反之則針對各個座位進行控管</li>
          <li>點按<strong>專輯封面</strong>可以先試聽，再按一下停止。</li>
          <li>點擊兩下<strong>藝人名稱</strong>、<strong>專輯名稱</strong>可以另外開啟 spotify 該藝人、該專輯的頁面</li>
          <li>有什麼 bug 或者需要什麼新功能再回報給羅，感恩感謝！</li>
          <li>版面懶得設計，就先醜醜的這樣</li>
        </ol>
      </section>
    </div>

    <form @submit.prevent="handleLogin">
      <div class="mx-4 my-8">
        <label for="email" class="text-primary block text-lg">Email</label>
        <input type="email" id="email" v-model="email" class="bg-tertiary-2 w-full rounded px-3 py-2 text-lg" />

        <label for="password" class="text-primary mt-4 block text-lg">Password</label>
        <input
          type="password"
          id="password"
          v-model="password"
          class="bg-tertiary-2 w-full rounded px-3 py-2 text-lg"
        />
      </div>
      <div class="mx-4">
        <button
          type="submit"
          class="text-natural-white bg-system-success1 w-full rounded-full py-3 text-center text-4xl"
        >
          Login
        </button>
      </div>
    </form>
  </main>
</template>
