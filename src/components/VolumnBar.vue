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
    step: {
      type: Number,
      default: 1,
    },
    disabledBar: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:change', 'plus', 'minus'],
}
</script>
<template>
  <div :class="$attrs.class" class="h-12 bg-tertiary-1 bg-opacity-60 rounded px-2 flex items-center">
    <span class="text-primary font-bold w-7 flex-shrink-0 text-center">{{ modelValue }}</span>
    <IconVolumn class="ml-3" />

    <button
      :disabled="$attrs.disabled"
      class="_volumn_bar_button btn-tertiary order-11"
      type="button"
      @click="$emit('minus', modelValue - step)"
    >
      <IconMinus />
    </button>
    <button
      :disabled="$attrs.disabled"
      class="_volumn_bar_button btn-tertiary order-12"
      type="button"
      @click="$emit('plus', modelValue + step)"
    >
      <IconPlus />
    </button>
    <!-- v-bind="$attrs" 會連 class... 也綁，所以只指定需要的 -->
    <input
      :value="modelValue"
      :min="$attrs.min"
      :max="$attrs.max"
      :disabled="disabledBar || $attrs.disabled"
      :step="step"
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
