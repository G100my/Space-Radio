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

    <div class="flex text-body text-natural-black items-center">
      <p :class="{ 'mb-1': contentText }">{{ title }}</p>
      <button v-if="closeButton" class="ml-auto h-9 w-9 flex justify-center items-center" @click="$emits('close')">
        <IconClose class="w-2.5 h-2.5 text-natural-gray3" />
      </button>
    </div>

    <p class="col-start-2 col-end-3 text-small text-tertiary-1">{{ contentText }}</p>
  </TransitionRoot>
</template>
<style lang="postcss">
._base_alert {
  @apply overflow-hidden px-4 py-2 border translate-y-1 grid;
  grid-template-columns: min-content 1fr;
}
._alert_error {
  @apply bg-system-error3 border-system-error2;
}
._alert_success {
  @apply bg-system-success3 border-system-success2;
}
._alert_icon_sm {
  @apply h-4 w-4 mr-3;
}
._alert_icon_lg {
  @apply h-5 w-5 mr-6;
}
</style>
