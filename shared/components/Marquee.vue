<script setup lang="ts">
// root element is <div>, can't not place in <p>
import { ref } from 'vue'

defineOptions({
  inheritAttrs: false,
})

defineProps<{
  text?: string
}>()

const mainChild = ref<HTMLSpanElement>()
const isFilled = ref(false)
const innerHTML = ref('')

const mouseenterHandler = (event: MouseEvent) => {
  const mainChild = event.currentTarget as HTMLSpanElement
  if (mainChild.offsetWidth > mainChild.parentElement!.offsetWidth) {
    isFilled.value = true
    innerHTML.value = mainChild.innerHTML
  }
}
</script>
<template>
  <div class="overflow-hidden">
    <p class="_marquee_content" :class="{ active: isFilled }" @animationend="isFilled = false">
      <span ref="mainChild" class="_sentence _main_child" v-bind="$attrs" @mouseenter="mouseenterHandler">
        <slot>{{ text }}</slot>
      </span>
      <span v-if="isFilled" v-bind="$attrs" class="_sentence" v-html="innerHTML" />
    </p>
  </div>
</template>
<style>
@keyframes marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-100%);
  }
}

._marquee_content {
  @apply text-0 overflow-hidden overflow-ellipsis whitespace-nowrap;
}
._marquee_content:hover ._sentence {
  @apply max-w-none;
}
._marquee_content.active {
  @apply relative w-fit overflow-visible overflow-ellipsis;
  animation: marquee 10s linear 1;
}
._marquee_content.active > ._sentence {
  @apply w-max pr-10;
}
._marquee_content.active > ._sentence + ._sentence {
  @apply absolute;
}
._sentence {
  @apply inline-block max-w-full space-x-1 overflow-hidden overflow-ellipsis whitespace-nowrap text-base;
}
</style>
