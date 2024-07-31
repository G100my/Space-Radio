<script lang="ts" setup>
// use Remixicon
defineProps<{
  name: string
  alias?: string
}>()
</script>
<template>
  <i :class="'ri-' + name" />
</template>
