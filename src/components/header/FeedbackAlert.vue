<script lang="ts">
import { useAlertStore } from '@/store'
import BaseAlert from '../base/BaseAlert.vue'

export default {
  components: { BaseAlert },
  setup() {
    const store = useAlertStore()
    return {
      items: store.items,
      closeAlert: store.closeAlert,
    }
  },
}
</script>
<template>
  <div>
    <BaseAlert
      v-for="(item, index) in items"
      :key="item.randomKey"
      :closeButton="true"
      :iconSize="'lg'"
      :error="item.error"
      :title="item.message"
      @close="closeAlert(index)"
    />
  </div>
</template>
