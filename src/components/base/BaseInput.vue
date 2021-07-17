<script>
export default {
  inheritAttrs: false,
  props: {
    modelValue: {
      type: [String, Number],
      default: '',
    },
  },
  emits: ['update:modelValue'],
}
</script>
<template>
  <div class="_base_input">
    <input :value="modelValue" v-bind="$attrs" @input="$emit('update:modelValue', $event.target.value)" />
    <slot />
  </div>
</template>
<style lang="postcss">
._base_input > input {
  @apply mt-1.5 w-full bg-tertiary-1 border border-tertiary-2 border-opacity-60 -shadow-4 px-4 py-3 text-natural-gray1 rounded text-body;
  &:focus {
    @apply border-primary border-opacity-80 outline-none;
  }
}
._base_input > input::placeholder {
  @apply text-natural-gray3;
}
</style>
