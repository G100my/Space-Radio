<script setup lang="ts">
defineProps<{
  summaryText: string
}>()
</script>
<template>
  <details class="relative h-8 overflow-auto transition-[height] open:h-72">
    <summary class="sticky top-0 bg-tertiary-2 p-1">{{ summaryText }}</summary>
    <slot />
  </details>
</template>
