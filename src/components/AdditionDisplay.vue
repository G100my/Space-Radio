<template>
  <transition name="addition-display">
    <div class="display-block">
      <div class="container">
        <template v-if="source.length === 0">
          <p class="no-result" @click="$emit('disactiveSearchStyle')">No result</p>
        </template>
        <template v-else>
          <TrackGridShell>
            <template #body>
              <TrackGridItem v-for="(track, index) in source" :key="track.id + index" :info="track">
                <AddButton :track-id="track.id" :track-name="track.name" />
                <JumpInButton :track-id="track.id" :track-name="track.name" v-bind="$attrs" />
              </TrackGridItem>
            </template>
          </TrackGridShell>
        </template>
      </div>
    </div>
  </transition>
</template>
<script>
import TrackGridItem from './template/TrackGridItem.vue'
import TrackGridShell from './template/TrackGridShell.vue'
import AddButton from './featureButtons/AddButton.vue'
import JumpInButton from './featureButtons/JumpInButton.vue'

export default {
  components: {
    AddButton,
    JumpInButton,
    TrackGridItem,
    TrackGridShell,
  },
  inheritAttrs: false,
  props: {
    displayActive: {
      type: Boolean,
      default: false,
    },
    source: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['disactiveSearchStyle'],
}
</script>
<style lang="scss">
.no-result {
  height: 100%;
  min-width: 50%;
  text-align: center;
  margin: 0;
  overflow: hidden;
}

.display-block {
  background-color: var(--secondary-dark);
  box-sizing: border-box;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: calc(100vh - 100%);
  overflow-y: hidden;
  display: flex;
  justify-content: center;
  @media (min-width: 768px) {
    top: 70px;
    width: min-content;
    left: auto;
    height: auto;
    min-width: 50%;
    display: flex;
  }
  .container {
    margin: 0 0 30px;
    overflow-y: auto;
  }
}
.addition-display-leave-active,
.addition-display-enter-active {
  transition: transform 0.2s ease-in-out;
}
.addition-display-enter-to,
.addition-display-leave-from {
  transform: translateX(0);
}
.addition-display-enter-from,
.addition-display-leave-to {
  transform: translateX(100%);
}
</style>
