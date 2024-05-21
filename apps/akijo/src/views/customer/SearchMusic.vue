<script setup lang="ts">
import { IconWrapper } from 'shared'
import { ref } from 'vue'

const keyword = ref('')
</script>
<template>
  <section>
    <div class="mx-auto w-fit my-5 flex items-center gap-2">
      <label>關鍵字: </label>
      <input v-model="keyword" type="text" class="bg-transparent border-0 border-b-2" />
      <button type="button" class="w-10 flex items-center justify-center">
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
