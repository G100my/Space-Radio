<script setup lang="ts">
import { IconWrapper } from 'shared'
import { ref } from 'vue'

const keyword = ref('')
</script>
<template>
  <section>
    <div class="mx-auto my-5 flex w-fit items-center gap-2">
      <label>關鍵字: </label>
      <input v-model="keyword" type="text" class="border-0 border-b-2 bg-transparent" />
      <button type="button" class="flex w-10 items-center justify-center">
        <IconWrapper name="search-line" class="text-2xl" />
      </button>
    </div>
    <div class="overflow-auto">
      <ul>
        <li></li>
      </ul>
    </div>
  </section>
</template>
