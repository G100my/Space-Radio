<script setup lang="ts">
import { routeMap } from '@/constant'
import { PKCE } from 'shared'
import { generateAuthParams } from 'shared'

function handleLogin() {
  PKCE(generateAuthParams(routeMap.Queue))
}
</script>
<template>
  <main class="h-full max-w-lg p-5">
    <div>
      <h1 class="text-primary text-center text-5xl">Akijo Radio</h1>
      <section class="my-6 space-y-3 px-4">
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
    <div>
      <button
        type="button"
        class="text-natural-white bg-system-success1 w-full rounded-full py-3 text-center text-4xl"
        @click="handleLogin"
      >
        Loggin Spotify
      </button>
    </div>
  </main>
</template>
