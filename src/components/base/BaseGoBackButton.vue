<template>
  <button type="button" class="text-gray-600 absolute flex items-center w-max bottom-full transform -translate-y-5">
    <ChevronLeftIcon class="w-8" />
    <span class="whitespace-nowrap">Go Back</span>
  </button>
</template>
<script>
import { ChevronLeftIcon } from '@heroicons/vue/solid'
export default {
  components: {
    ChevronLeftIcon,
  },
}
</script>