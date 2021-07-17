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
  inheritAttrs: false,
  props: {
    modelValue: {
      type: Number,
      required: true,
    },
  },
  emits: ['update:change'],
}
</script>
<template>
  <div :class="$attrs.class" class="h-12 bg-tertiary-1 bg-opacity-60 rounded px-2 flex items-center">
    <span class="text-primary font-bold w-7 flex-shrink-0 text-center">{{ modelValue }}</span>
    <IconVolumn class="ml-3" />

    <button
      class="_volumn_bar_button btn-tertiary order-11"
      type="button"
      @click="$emit('update:change', modelValue - step)"
    >
      <IconMinus />
    </button>
    <button
      class="_volumn_bar_button btn-tertiary order-12"
      type="button"
      @click="$emit('update:change', modelValue + step)"
    >
      <IconPlus />
    </button>

    <input
      :value="modelValue"
      :min="$attrs.min"
      :max="$attrs.max"
      :step="$attrs.step"
      type="range"
      class="ml-3"
      @input="$emit('update:change', Number($event.target.value))"
    />
  </div>
</template>
<style lang="postcss">
._volumn_bar_button:focus ~ input[type='range'] {
  &::-webkit-slider-runnable-track {
    @apply bg-primary;
  }
  &::-moz-range-track {
    @apply bg-primary;
  }
}
</style>
