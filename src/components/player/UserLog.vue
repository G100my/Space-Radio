<template>
  <ul class="log-container">
    <li v-for="log in logs" :key="log.timestamp">
      <p v-if="log.action_type === 'add' || log.action_type === 'jumpIn'">
        <span>{{ log.user_name }}</span
        >{{ log.action_type === 'add' ? '點' : '插' }}播了<span>{{ log.option.track_name }}</span>
      </p>
      <p v-else-if="log.action_type === 'normalRemove' || log.action_type === 'urgentRemove'">
        <span>{{ log.user_name }}</span
        >從{{ log.action_type === 'normalRemove' ? '點' : '插' }}播序列移除了<span>{{ log.option.track_name }}</span>
      </p>
      <p v-else-if="log.action_type === 'normal2urgent' || log.action_type === 'urgent2normal'">
        <span>{{ log.user_name }}</span
        >把<span>{{ log.option.track_name }}</span
        >移到{{ log.action_type === 'normal2urgent' ? '點' : '插' }}播序列
      </p>
      <p v-else-if="log.action_type === 'turnUp' || log.action_type === 'turnDown'">
        <span>{{ log.user_name }}</span
        >調高音量至:<span>{{ log.option.volume }}</span>
      </p>
      <p v-else-if="log.action_type === 'increaseDislike' || log.action_type === 'reduceDislike'">更新切歌投票數</p>
      <p v-else-if="log.action_type === 'updateMinimalVolume'">
        <span>{{ log.user_name }}</span
        >將最小撥放音量調整為<span>{{ log.option.minimal_volume }}</span>
      </p>
      <p v-else-if="log.action_type === 'updateDislikeThreshold'">
        <span>{{ log.user_name }}</span
        >將最小投票數調整為<span>{{ log.option.dislike_threshold }}</span>
      </p>
    </li>
    <li v-if="logs.length === 0"><p>- - No logs - -</p></li>
  </ul>
</template>
<script>
export default {
  computed: {
    logs() {
      return this.$store.getters.userLog
    },
  },
}
</script>
<style lang="scss">
.log-container {
  padding: 5px;
  border: 1px solid var(--ignore);
  background-color: var(--secondary-dark);
  border-radius: var(--border-radius);
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  p {
    text-align: center;
    color: var(--ignore);
    font-size: 14px;
  }
  span {
    display: inline-block;
    margin: 0 5px;
    color: var(--secondary-neutral);
    &:first-child {
      color: var(--secondary-highlight);
    }
  }
}
</style>
