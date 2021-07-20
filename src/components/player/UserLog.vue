<script>
import { computed } from 'vue'
import { useStore } from 'vuex'
import IconVolumn from '@/assets/icons/icon/volumn.svg'
import IconArrowUp from '@/assets/icons/icon-arrow-up.svg'
import IconArrowDown from '@/assets/icons/icon-arrow-down.svg'
import IconPlus from '@/assets/icons/icon-plus.svg'
import IconClose from '@/assets/icons/icon/close.svg'
import IconSkipSong from '@/assets/icons/icon/skipsong.svg'
import IconRoomSetting from '@/assets/icons/icon-roomsetting.svg'
import BaseMarquee from '../base/BaseMarquee.vue'

export default {
  components: {
    IconVolumn,
    IconArrowUp,
    IconArrowDown,
    IconPlus,
    IconClose,
    IconSkipSong,
    IconRoomSetting,
    BaseMarquee,
  },
  setup() {
    const store = useStore()
    function addZero(num) {
      return num < 10 ? '0' + num.toString() : num.toString()
    }
    function timeTransfer(timestamp) {
      const time = new Date(timestamp)
      return addZero(time.getHours()) + ':' + addZero(time.getMinutes())
    }
    return {
      logs: computed(() => store.getters.userLog),
      // fixme 音量變成紀錄 音量偏移量
      // currentVolume: computed(() => store.getters.currentVolume),
      timeTransfer,
    }
  },
}
</script>
<template>
  <div id="user-log" class="overflow-y-auto">
    <h3 class="text-natural-gray3 font-bold">Records</h3>
    <ul class="mt-4 text-natural-gray2 space-y-5 overflow-y-auto">
      <li v-for="log in logs" :key="log.timestamp">
        <div class="flex">
          <span class="flex-0 mr-5">
            <IconPlus v-if="['add', 'addMultiple'].includes(log.action_type)" />
            <IconArrowDown v-else-if="log.action_type === 'urgent2normal'" />
            <IconArrowUp v-else-if="['jumpIn', 'normal2urgent'].includes(log.action_type)" />
            <IconClose v-else-if="['normalRemove', 'urgentRemove'].includes(log.action_type)" />
            <IconVolumn v-else-if="['turnUp', 'turnDown'].includes(log.action_type)" />
            <IconSkipSong v-else-if="['increaseDislike', 'reduceDislike'].includes(log.action_type)" />
            <IconRoomSetting v-else-if="['updateMinimalVolume', 'updateDislikeThreshold'].includes(log.action_type)" />
          </span>

          <span class="flex-0 whitespace-nowrap w-fit mr-4">{{ timeTransfer(log.timestamp) }}</span>

          <p class="flex-1 min-w-0">
            <BaseMarquee
              v-if="
                ['add', 'jumpIn', 'normalRemove', 'urgentRemove', 'normal2urgent', 'urgent2normal'].includes(
                  log.action_type
                )
              "
              :text="log.option.track_name"
            />
            <template v-else-if="log.action_type === 'addMultiple'">
              <BaseMarquee v-for="(name, index) in log.option.names" :key="index" class="flex flex-col w-full">
                <span>{{ name }}</span>
              </BaseMarquee>
            </template>
            <span v-else-if="['turnUp', 'turnDown'].includes(log.action_type)"
              >Adjust Volumn: {{ log.option.volume }}</span
            >
            <span v-else-if="log.action_type === 'updateMinimalVolume'"
              >Minimal Volume: {{ log.option.minimal_volume }}</span
            >
            <span v-else-if="log.action_type === 'updateDislikeThreshold'"
              >Skip threshold: {{ log.option.dislike_threshold }}
            </span>
          </p>
        </div>
      </li>
      <li v-if="logs.length === 0"><p>- - No logs - -</p></li>
    </ul>
  </div>
</template>
