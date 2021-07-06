<script>
export default {
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
  <div class="base-input">
    <input v-model="value" v-bind="$attrs" @input="$emit('update:modelValue', $event.target.value)" />
    <slot />
  </div>
</template>
<style lang="postcss">
.base-input > input {
  @apply mt-1.5 w-full bg-tertiary-1 border border-tertiary-2 border-opacity-60 -shadow-4 px-4 py-3 text-natural-gray1 rounded text-body;
  &:focus {
    @apply border-primary border-opacity-80 outline-none;
  }
}
.base-input > input::placeholder {
  @apply text-natural-gray3;
}
</style>
