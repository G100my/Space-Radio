<script>
import IconVolumn from '@/assets/icons/icon/volumn.svg'
import IconPlus from '@/assets/icons/icon-plus.svg'
import IconMinus from '@/assets/icons/icon-minus.svg'

export default {
  components: {
    IconVolumn,
    IconPlus,
    IconMinus,
  },
  props: {
    value: {
      type: Number,
      required: true,
    },
  },
  emits: ['plus', 'minus'],
}
</script>
<template>
  <div class="h-12 bg-tertiary-1 bg-opacity-60 rounded px-2 flex items-center">
    <span class="text-primary font-bold">{{ value }}</span>
    <IconVolumn class="ml-3" />
    <div class="ml-3 flex-1 bg-tertiary-2 bg-opacity-60">
      <div class="rounded-sm h-0.5 bg-natural-white" :style="{ width: `${value}%` }" />
    </div>
    <div class="flex">
      <button class="btn-tertiary" type="button" @click="$emit('minus')">
        <IconMinus />
      </button>
      <button class="btn-tertiary" type="button" @click="$emit('plus')">
        <IconPlus />
      </button>
    </div>
  </div>
</template>
