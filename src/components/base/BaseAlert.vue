<script>
import { TransitionRoot } from '@headlessui/vue'
import { computed } from 'vue'
import IconError from '@/assets/icons/icon/error.svg'
import IconSuccess from '@/assets/icons/icon/successfully.svg'
import IconClose from '@/assets/icons/icon/close.svg'

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
      validator(value) {
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
    enter-to="max-h-full"
    leave="transition-all duration-150"
    leave-from="max-h-full"
    leave-to="max-h-0"
  >
    <label class="self-center" :class="{ _alert_icon_sm: iconSize === 'sm', _alert_icon_lg: iconSize === 'lg' }">
      <IconError v-if="error" class="h-full w-full text-system-error1" />
      <IconSuccess v-else class="h-full w-full text-system-success2" />
    </label>

    <div class="flex items-center text-body text-natural-black">
      <p :class="{ 'mb-1': contentText }">{{ title }}</p>
      <button v-if="closeButton" class="ml-auto flex h-9 w-9 items-center justify-center" @click="$emit('close')">
        <IconClose class="h-2.5 w-2.5 text-natural-gray3" />
      </button>
    </div>

    <p class="col-start-2 col-end-3 text-small text-tertiary-1">{{ contentText }}</p>
  </TransitionRoot>
</template>
<style lang="postcss">
._base_alert {
  @apply grid translate-y-1 overflow-hidden rounded-sm border px-4 py-px;
  grid-template-columns: min-content 1fr;
}
._alert_error {
  @apply border-system-error2 bg-system-error3;
}
._alert_success {
  @apply border-system-success2 bg-system-success3;
}
._alert_icon_sm {
  @apply mr-3 h-4 w-4;
}
._alert_icon_lg {
  @apply mr-6 h-5 w-5;
}
</style>
