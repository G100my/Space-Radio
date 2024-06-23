<script setup lang="ts">
import { PKCE } from 'shared'
import { generateAuthParams } from '@/api/spotifyWrappedAPI'
import { SPOTIFY_HOST_REDIRECT_URI } from '@/constant'

function handleLogin() {
  PKCE(generateAuthParams(SPOTIFY_HOST_REDIRECT_URI))
}
</script>
<template>
  <main class="h-full max-w-lg p-5">
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
