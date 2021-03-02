<template>
  <transition name="addition-display">
    <div class="display-block">
      <template v-if="source.length === 0">
        <p class="no-result" @click="$emit('disactiveSearchStyle')">No result</p>
      </template>
      <template v-else>
        <TrackGridShell>
          <template #body>
            <TrackGridItem v-for="track in source" :key="track.id" :info="track">
              <AddButton :track-id="track.id" :track-name="track.name" />
              <JumpInButton :track-id="track.id" :track-name="track.name" v-bind="$attrs" />
            </TrackGridItem>
          </template>
        </TrackGridShell>
      </template>
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
  width: 100%;
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
  overflow-y: auto;
  @media (min-width: 768px) {
    position: static;
    flex: 1 1 0;
    height: 100%;
  }
}
.addition-display-leave-active,
.addition-display-enter-active {
  transition: transform 0.2s ease-in-out;
  @media (min-width: 768px) {
    transition: flex-grow 0.3s ease-in-out;
    transform: translateZ(0);
  }
}
.addition-display-enter-to,
.addition-display-leave-from {
  transform: translateX(0);
  @media (min-width: 768px) {
    flex-grow: 1;
  }
}
.addition-display-enter-from,
.addition-display-leave-to {
  transform: translateX(100%);
  @media (min-width: 768px) {
    flex-grow: 0;
  }
}
</style>
