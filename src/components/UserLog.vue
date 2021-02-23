<template>
  <ul class="log-container">
    <li v-for="log in logs" :key="log.timestemp">
      <p v-if="log.actionType === 'add' || log.actionType === 'jumpIn'">
        <span>{{ log.userId }}</span
        >{{ log.actionType === 'add' ? '點' : '插' }}播了<span>{{ log.option.trackName }}</span>
      </p>
      <p v-else-if="log.actionType === 'normalRemove' || log.actionType === 'urgentRemove'">
        <span>{{ log.userId }}</span
        >從{{ log.actionType === 'normalRemove' ? '點' : '插' }}播序列移除了<span>{{ log.option.trackName }}</span>
      </p>
      <p v-else-if="log.actionType === 'normal2urgent' || log.actionType === 'urgent2normal'">
        <span>{{ log.userId }}</span
        >把<span>{{ log.option.trackName }}</span
        >移到{{ log.actionType === 'normal2urgent' ? '點' : '插' }}播序列
      </p>
      <p v-else-if="log.actionType === 'turnUp' || log.actionType === 'turnDown'">
        <span>{{ log.userId }}</span
        >調高音量至:<span>{{ log.option.volume }}</span>
      </p>
      <p v-else-if="log.actionType === 'increaseDislike' || log.actionType === 'reduceDislike'">更新切歌投票數</p>
    </li>
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
  height: 100%;
  border: 1px solid var(--primary-highlight);
  background-color: var(--secondary-dark);
  border-radius: var(--border-radius);
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  p {
    text-align: center;
    color: var(--ignore);
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
