<template>
  <div class="mt-24 relative">
    <button type="button" class="text-gray-600 flex absolute bottom-full transform -translate-y-5">
      <IconChevronLeft />
      <span>Go Back</span>
    </button>
    <h2 class="text-subtitle font-semibold mb-4">Create room</h2>
    <form class="text-gray-600">
      <div class="room-setting-form-item">
        <div>
          <label for="minimal-volume">Minimal Volume*</label>
          <BasePlusButton @click="test" />
          <span>1</span>
          <BaseMinusButton />
        </div>
        <input id="minimal-volume" type="range" />
      </div>
      <div class="room-setting-form-item">
        <div>
          <label>Initial Volumn*</label>
          <BasePlusButton @click="test" />
          <span>1</span>
          <BaseMinusButton />
        </div>
        <input type="range" />
      </div>
      <div class="room-setting-form-item">
        <div>
          <label>Skip Song threshold*</label>
          <BasePlusButton @click="test" />
          <span>1</span>
          <BaseMinusButton />
        </div>
      </div>
      <div class="mt-5">
        <p>Choose a playlist as recommendation references</p>
        <select class="w-full p-4 mt-0.5 bg-white border-2 border-black">
          <option>fff</option>
        </select>
      </div>
    </form>
    <button class="btn btn-spotify-bg-green w-full mt-6" type="button">Create</button>
  </div>
</template>
<script>
import { useRoute } from 'vue-router'
import IconChevronLeft from '../../assets/icons/chevron-left.vue'
import BasePlusButton from '../../components/base/BasePlusButton.vue'
import BaseMinusButton from '../../components/base/BaseMinusButton.vue'
export default {
  components: {
    IconChevronLeft,
    BasePlusButton,
    BaseMinusButton,
  },
  setup() {
    const roomName = useRoute().params
    console.log(roomName)
    return {}
  },
}
</script>
<style lang="postcss">
.room-setting-form-item {
  @apply lg:mt-5;
  & > div {
    @apply flex;
  }
  & label {
    @apply mr-auto;
  }
  & span {
    @apply w-4 mx-3 text-center;
  }
  & input {
    @apply mt-2;
  }
}
.room-setting-form-item + .room-setting-form-item {
  @apply mt-6;
}
</style>
