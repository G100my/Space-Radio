<script>
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { Switch, SwitchGroup, SwitchLabel } from '@headlessui/vue'
import { computed } from '@vue/runtime-core'
export default {
  components: {
    Switch,
    SwitchGroup,
    SwitchLabel,
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
  <div class="h-full mx-auto flex flex-col text-natural-gray2 max-w-sm gap-y-5">
    <div class="flex-col gap-5">
      <div class="flex flex-shrink-0 flex-grow items-center justify-center">
        <img class="w-32 h-32 rounded-full ring-2 ring-natural-black" :src="$store.getters.userImage" alt="" />
      </div>
      <ul class="_user-info-list flex-grow-[3] my-4 flex flex-col justify-between gap-4">
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
    <p class="text-lg text-center py-3 bg-black bg-opacity-30 rounded-md">
      You are
      <span class="text-primary">{{ $store.getters.isHostUser ? `Host` : `Customer` }}</span>
      in <span class="text-primary">{{ $store.getters.roomName }}</span> room.
    </p>
    <div v-if="isHostUser !== undefined && !isHostUser">
      <SwitchGroup as="div" class="flex items-end justify-between">
        <SwitchLabel class="mr-4 text-xl">Enable local player</SwitchLabel>
        <Switch
          :value="customerPlayerMode"
          :class="customerPlayerMode ? 'bg-primary' : 'bg-natural-gray3'"
          class="relative inline-flex flex-shrink-0 h-[22px] w-[38px] border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
          @click="changedHandler"
          @keypress="
            event => {
              if (event.code === 'Enter' || event.code === 'Space') changedHandler()
            }
          "
        >
          <span class="sr-only">Use setting</span>
          <span
            aria-hidden="true"
            :class="customerPlayerMode ? 'translate-x-4' : 'translate-x-0'"
            class="pointer-events-none inline-block h-[18px] w-[18px] rounded-full bg-white shadow-lg transform ring-0 transition ease-in-out duration-200"
          />
        </Switch>
      </SwitchGroup>
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
