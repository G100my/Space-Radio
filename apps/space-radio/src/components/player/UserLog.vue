<script lang="ts">
import { computed } from 'vue'
import IconVolumn from '@/assets/icons/icon/volumn.svg?component'
import IconArrowUp from '@/assets/icons/icon-arrow-up.svg?component'
import IconArrowDown from '@/assets/icons/icon-arrow-down.svg?component'
import IconPlus from '@/assets/icons/icon-plus.svg?component'
import IconClose from '@/assets/icons/icon/close.svg?component'
import IconSkipSong from '@/assets/icons/icon/skipsong.svg?component'
import IconRoomSetting from '@/assets/icons/icon-roomsetting.svg?component'
import { Marquee } from 'shared'
import { useUserLogStore } from '@/store/UserLogStore'

export default {
  components: {
    IconVolumn,
    IconArrowUp,
    IconArrowDown,
    IconPlus,
    IconClose,
    IconSkipSong,
    IconRoomSetting,
    Marquee,
  },
  setup() {
    const store = useUserLogStore()
    function addZero(num: number) {
      return num < 10 ? '0' + num.toString() : num.toString()
    }
    function timeTransfer(timestamp: string | number) {
      const time = new Date(timestamp)
      return addZero(time.getHours()) + ':' + addZero(time.getMinutes())
    }
    return {
      logs: computed(() => store.logs),
      // fixme 音量變成紀錄 音量偏移量
      // currentVolume: computed(() => store.getters.currentVolume),
      timeTransfer,
    }
  },
}
</script>
<template>
  <div id="user-log" class="flex-col gap-y-4">
    <h3 class="text-natural-gray3 font-bold">Records</h3>
    <ul class="text-natural-gray2 flex-1 space-y-5 overflow-y-auto">
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

          <span class="flex-0 mr-4 w-fit whitespace-nowrap">{{ timeTransfer(log.timestamp) }}</span>

          <div class="min-w-0 flex-1">
            <Marquee
              v-if="
                ['add', 'jumpIn', 'normalRemove', 'urgentRemove', 'normal2urgent', 'urgent2normal'].includes(
                  log.action_type
                )
              "
              :text="log.payload as string"
            />
            <template v-else-if="log.action_type === 'addMultiple'">
              <Marquee v-for="(name, index) in log.payload" :key="index" class="flex w-full flex-col">
                <span>{{ name }}</span>
              </Marquee>
            </template>
            <span v-else-if="['turnUp', 'turnDown'].includes(log.action_type)">Adjust Volumn: {{ log.payload }}</span>
            <span v-else-if="log.action_type === 'updateMinimalVolume'">Minimal Volume: {{ log.payload }}</span>
            <span v-else-if="log.action_type === 'updateDislikeThreshold'">Skip threshold: {{ log.payload }} </span>
            <span v-else-if="log.action_type === 'reduceDislike'">Someone want to skip: {{ log.payload }} </span>
            <span v-else-if="log.action_type === 'increaseDislike'">Someone cancel skip: {{ log.payload }} </span>
          </div>
        </div>
      </li>
      <li v-if="logs.length === 0"><p>- - No logs - -</p></li>
    </ul>
  </div>
</template>
