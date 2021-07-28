<script>
import { computed } from '@vue/runtime-core'
import BaseAlert from '../base/BaseAlert.vue'
import { useStore } from 'vuex'

export default {
  components: { BaseAlert },
  setup() {
    const store = useStore()
    return {
      feedbacks: computed(() => store.getters.feedbacks),
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
      @close="$store.dispatch('closeFeedback', index)"
    />
  </div>
</template>