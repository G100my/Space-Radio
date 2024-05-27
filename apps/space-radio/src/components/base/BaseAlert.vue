<script lang="ts">
import { TransitionRoot } from '@headlessui/vue'
import { computed } from 'vue'
import IconError from '@/assets/icons/icon/error.svg?component'
import IconSuccess from '@/assets/icons/icon/successfully.svg?component'
import IconClose from '@/assets/icons/icon/close.svg?component'

export default {
  components: {
    TransitionRoot,
    IconError,
    IconSuccess,
    IconClose,
  },
  props: {
    title: {
      type: String,
      required: true,
      default: 'message title',
    },
    contentText: {
      type: String,
      default: '',
    },
    show: {
      type: Boolean,
      default: true,
    },
    error: {
      type: Boolean,
      default: false,
    },
    closeButton: {
      type: Boolean,
      default: false,
    },
    iconSize: {
      type: String,
      default: 'sm',
      validator(value: string) {
        return ['sm', 'lg'].includes(value)
      },
    },
  },
  emits: ['close'],
  setup(props) {
    return {
      isShow: computed(() => Boolean(props.title) && props.show),
    }
  },
}
</script>
<template>
  <TransitionRoot
    :show="isShow"
    appear
    as="div"
    class="_base_alert"
    :class="{ _alert_error: error, _alert_success: !error }"
    enter="transition-all duration-75"
    enter-from="max-h-0"
    enter-to="max-h-fit"
    leave="transition-all duration-150"
    leave-from="max-h-fit"
    leave-to="max-h-0"
  >
    <div class="self-center" :class="{ _alert_icon_sm: iconSize === 'sm', _alert_icon_lg: iconSize === 'lg' }">
      <IconError v-if="error" class="text-system-error1" />
      <IconSuccess v-else class="text-system-success2" />
    </div>

    <div class="text-body text-natural-black flex items-center">
      <p :class="{ 'mb-1': contentText }">{{ title }}</p>
      <button v-if="closeButton" class="ml-auto flex h-9 w-9 items-center justify-center" @click="$emit('close')">
        <IconClose class="text-natural-gray3 h-5 w-5" />
      </button>
    </div>

    <p class="text-small text-tertiary-1 col-start-2 col-end-3">{{ contentText }}</p>
  </TransitionRoot>
</template>
<style>
._base_alert {
  @apply grid min-h-fit translate-y-1 overflow-hidden rounded-sm border px-4 py-1;
  grid-template-columns: min-content 1fr;
}
._alert_error {
  @apply border-system-error2 bg-system-error3;
}
._alert_success {
  @apply border-system-success2 bg-system-success3;
}
._alert_icon_sm > svg {
  @apply mr-3 h-5 w-5;
}
._alert_icon_lg > svg {
  @apply mr-6 h-6 w-6;
}
</style>
