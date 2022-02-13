<script>
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { computed } from '@vue/runtime-core'
import BaseSwitch from '../base/BaseSwitch.vue'
export default {
  components: {
    BaseSwitch,
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    const customerPlayerMode = computed(() => store.getters.customerPlayerMode)
    const isHostUser = computed(() => store.getters.isHostUser)
    function changedHandler() {
      store.commit('toggleCustomerPlayer', !customerPlayerMode.value)
    }
    function localClear() {
      localStorage.clear()
      router.push({ name: 'Hall' })
      location.reload()
    }
    return {
      localClear,
      customerPlayerMode,
      changedHandler,
      isHostUser,
    }
  },
}
</script>
<template>
  <div class="mx-auto flex h-full max-w-sm flex-col gap-y-5 text-natural-gray2">
    <div class="flex-col gap-5">
      <div class="flex flex-shrink-0 flex-grow items-center justify-center">
        <img class="h-32 w-32 rounded-full ring-2 ring-natural-black" :src="$store.getters.userImage" alt="" />
      </div>
      <ul class="_user-info-list my-4 flex flex-grow-[3] flex-col justify-between gap-4">
        <li>
          <span>User id:</span>
          <span>{{ $store.getters.userId }}</span>
        </li>
        <li>
          <span>User name:</span>
          <span>{{ $store.getters.userName }}</span>
        </li>
        <li>
          <span>Account level:</span>
          <span class="text-primary">{{ $store.getters.accountLevel }}</span>
        </li>
      </ul>
    </div>
    <p class="rounded-md bg-black bg-opacity-30 py-3 text-center text-lg">
      You are
      <span class="text-primary">{{ $store.getters.isHostUser ? `Host` : `Customer` }}</span>
      in <span class="text-primary">{{ $store.getters.roomName }}</span> room.
    </p>
    <div v-if="isHostUser !== undefined && !isHostUser">
      <BaseSwitch
        :modelValue="customerPlayerMode"
        label="Enable local player"
        class="flex items-end justify-between"
        @update:modelValue="changedHandler"
      />
    </div>
    <!-- 最喜歡藝人 -->
    <!-- 最常撥放 -->
    <!-- 匯出 -->
    <!-- 刪除房間 -->
    <div class="mt-auto mb-7">
      <button class="btn-primary w-full font-semibold" type="button" @click="localClear">
        Delete catch on this device & reload window
      </button>
      <!-- 離開房間 -->
    </div>
  </div>
</template>
<style lang="postcss" scoped>
._user-info-list {
  & > li {
    @apply flex justify-between;
  }
}
</style>
