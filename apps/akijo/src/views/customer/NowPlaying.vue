<script setup lang="ts">
import img from '@/assets/_monkey.jpeg'
import placeholderImg from 'shared/assets/vinyl-record.png'
import { computed } from 'vue'

const imgSrc = computed(() => img ?? placeholderImg)
</script>
<template>
  <section class="">
    <aside class="relative mx-auto h-60 w-60">
      <img :src="imgSrc" class="h-full w-full" :class="{ 'animate-[spin_6s_linear_infinite]': !img }" />
    </aside>
    <div>
      <p></p>
      <p></p>
      <p></p>
      <p></p>
    </div>
  </section>
</template>
