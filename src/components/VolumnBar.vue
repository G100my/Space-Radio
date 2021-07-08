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
    modelValue: {
      type: Number,
      required: true,
    },
    step: {
      type: Number,
      default: 1,
    },
  },
  emits: ['update:change'],
}
</script>
<template>
  <div class="h-12 bg-tertiary-1 bg-opacity-60 rounded px-2 flex items-center">
    <span class="text-primary font-bold w-7 flex-shrink-0 text-center">{{ modelValue }}</span>
    <IconVolumn class="ml-3" />
    <!-- <div class="ml-3 flex-1 bg-tertiary-2 bg-opacity-60">
      <div class="rounded-sm h-0.5 bg-natural-white" :style="{ width: `${modelValue}%` }" />
    </div> -->

    <button
      class="volumn-bar-button btn-tertiary order-11"
      type="button"
      @click="$emit('update:change', modelValue - step)"
    >
      <IconMinus />
    </button>
    <button
      class="volumn-bar-button btn-tertiary order-12"
      type="button"
      @click="$emit('update:change', modelValue + step)"
    >
      <IconPlus />
    </button>

    <input
      :value="modelValue"
      v-bind="$attrs"
      :step="step"
      type="range"
      class="ml-3"
      @input="$emit('update:change', Number($event.target.value))"
    />
  </div>
</template>
<style lang="postcss">
.volumn-bar-button:focus ~ input[type='range'] {
  &::-webkit-slider-runnable-track {
    @apply bg-primary;
  }
  &::-moz-range-track {
    @apply bg-primary;
  }
}
</style>
