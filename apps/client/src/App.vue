<script setup lang="ts"></script>
<template>
  <div class="jf-openhuninn mx-auto flex h-full w-full max-w-xl flex-col">
    <Suspense>
      <RouterView />
    </Suspense>
  </div>
</template>
<style>
body {
  @apply h-screen max-h-dvh;
}
#app {
  @apply h-full;
}
</style>
