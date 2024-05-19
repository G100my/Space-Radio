<script lang="ts">
import { useRouter } from 'vue-router'
import BaseSwitch from '../base/BaseSwitch.vue'
import { usePersonalStore } from '@/store/PersonalStore'
import { useRoomBasicStore } from '@/store'
export default {
  components: {
    BaseSwitch,
  },
  setup() {
    const router = useRouter()
    function localClear() {
      localStorage.clear()
      router.push({ name: 'Hall' })
      location.reload()
    }
    return {
      localClear,
      personalStore: usePersonalStore(),
      roomBasicStore: useRoomBasicStore(),
    }
  },
}
</script>
<template>
  <div class="mx-auto flex h-full max-w-sm flex-col gap-y-5 text-natural-gray2">
    <div class="flex-col gap-5">
      <div class="flex flex-shrink-0 flex-grow items-center justify-center">
        <img class="h-32 w-32 rounded-full ring-2 ring-natural-black" :src="personalStore.image_url" alt="" />
      </div>
      <ul class="_user-info-list my-4 flex flex-grow-[3] flex-col justify-between gap-4">
        <li>
          <span>User id:</span>
          <span>{{ personalStore.user_id }}</span>
        </li>
        <li>
          <span>User name:</span>
          <span>{{ personalStore.display_name }}</span>
        </li>
        <li>
          <span>Account level:</span>
          <span class="text-primary">{{ personalStore.product }}</span>
        </li>
      </ul>
    </div>
    <p class="rounded-md bg-black bg-opacity-30 py-3 text-center text-lg">
      You are
      <span class="text-primary">{{ personalStore.isHostUser ? `Host` : `Customer` }}</span>
      in <span class="text-primary">{{ roomBasicStore.room_name }}</span> room.
    </p>
    <div v-if="personalStore.isHostUser !== undefined && !personalStore.isHostUser">
      <BaseSwitch
        :modelValue="!!personalStore.customerPlayerMode"
        label="Enable local player"
        class="flex items-end justify-between"
        @update:modelValue="personalStore.customerPlayerMode = $event"
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
