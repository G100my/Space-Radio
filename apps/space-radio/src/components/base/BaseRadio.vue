<script setup lang="ts">
defineProps<{
  modelValue: string | number
  label?: string
  value: string
  name: string
}>()
defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()
</script>
<template>
  <label class="flex flex-nowrap items-center p-1">
    <input
      :checked="modelValue === value"
      :name="name"
      type="radio"
      hidden
      class="peer sr-only"
      @change="$emit('update:modelValue', value)"
    />

    <span class="radio_button_dot" />

    <span v-if="label" class="ml-2 flex-1">{{ label }}</span>
  </label>
</template>
<style>
.radio_button_dot {
  @apply ring-natural-gray3 peer-checked:ring-primary flex h-3 w-3 items-center justify-center rounded-full ring-2;
}
.radio_button_dot::before {
  content: '';
  @apply bg-primary h-2 w-2 scale-0 rounded-full transition-transform;
}
input:checked + .radio_button_dot::before {
  @apply scale-100;
}
</style>
