<script>
import { useAlertStore } from '@/store'
import { computed } from 'vue'
import BaseAlert from '../base/BaseAlert.vue'

export default {
  components: { BaseAlert },
  setup() {
    const store = useAlertStore()
    return {
      feedbacks: computed(() => store.feedbacks),
    }
  },
}
</script>
<template>
  <div>
    <BaseAlert
      v-for="(feedback, index) in feedbacks"
      :key="feedback.randomKey"
      :closeButton="true"
      :iconSize="'lg'"
      :error="feedback.error"
      :title="feedback.message"
      @close="store.closeFeedback(index)"
    />
  </div>
</template>
