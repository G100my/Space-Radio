<script>
export default {
  setup() {
    function localClear() {
      localStorage.clear()
    }
    return {
      localClear,
    }
  },
}
</script>
<template>
  <div class="h-full mx-auto flex flex-col text-natural-gray2 max-w-sm">
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
    <p class="text-lg text-center mt-4 py-3 bg-black bg-opacity-30 rounded-md">
      You are
      <span class="text-primary">{{ $store.getters.isHostUser ? `Host` : `Customer` }}</span>
      in <span class="text-primary">{{ $store.getters.roomName }}</span> room.
    </p>
    <!-- 最喜歡藝人 -->
    <!-- 最常撥放 -->
    <!-- 匯出 -->
    <!-- 刪除房間 -->
    <div class="mt-auto mb-7">
      <button class="btn-primary w-full font-semibold" type="button" @click="localClear">
        Delete all catch on this device.
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
