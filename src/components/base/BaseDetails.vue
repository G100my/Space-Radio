<script setup lang="ts">
defineProps<{
  summaryText: string
}>()
</script>
<template>
  <details class="relative flex h-8 flex-col transition-[height] open:h-72">
    <summary class="cursor-pointer p-1">{{ summaryText }}</summary>
    <div class="h-64 overflow-auto">
      <slot />
    </div>
  </details>
</template>
