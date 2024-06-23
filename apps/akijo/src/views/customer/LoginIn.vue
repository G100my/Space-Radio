<script setup lang="ts">
import { PKCE } from 'shared'
import { generateAuthParams } from '@/api/spotifyWrappedAPI'
import { routeMap } from '@/constant'
</script>
<template>
  <section class="px-10">
    <div>
      <p class="text-2xl">注意事項：</p>
      <ol class="mt-6 list-decimal pl-5">
        <li>必須要有 spotify 帳號</li>
        <li>這裡不提供註冊連結，請自行搜尋</li>
        <li>請不要亂點一些不合時宜的音樂！</li>
        <li>如果聽到喜歡的可以點按收藏，<br />會自動出現一份“在Akijo聽到的”歌單</li>
        <li>“在Akijo聽到的”會顯示在"收入的歌單"</li>
        <li>此 App 僅記錄桌號，不會留下任何個資，請安心使用</li>
        <li>此 App 為 Akijo 自行開發，<br />有任何使用上問題可以 IG 上私訊 Akijo</li>
      </ol>
    </div>
    <div class="my-10">
      <button
        type="button"
        class="text-natural-white bg-system-success1 w-full rounded-full py-3 text-center text-4xl"
        @click="PKCE(generateAuthParams(routeMap.C_playing))"
      >
        登入 Spotify
      </button>
    </div>
  </section>
</template>
@/index
