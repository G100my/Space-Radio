<template>
  <div class="immediately-result" :class="{ 'display-active': displayActive }">
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
  <div class="result-mask" :class="{ 'display-active': displayActive }" />
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
  created() {
    console.log(this.$attrs)
  },
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

.result-mask,
.immediately-result {
  transition-duration: 0.3s;
  transition-timing-function: ease-in-out;
  transition-property: width, height;
  box-sizing: border-box;
  position: absolute;
  right: 0;
  height: 0;
}

.result-mask {
  background-color: var(--primary-dark);
  top: 0;
  width: 100vw;
  z-index: -2;
  opacity: 0.9;
  @media (min-width: 768px) {
    height: 100vh;
  }
}
.immediately-result {
  top: 100%;
  left: 0;
  width: 90vw;
  z-index: -1;
  overflow-y: auto;
  margin: 0 auto;
  box-sizing: border-box;
  @media (min-width: 768px) {
    margin: 0 0 0 auto;
  }
}
.result-mask,
.immediately-result {
  @media (min-width: 768px) {
    width: 0;
  }
}

.display-active.immediately-result {
  height: calc(100vh - 70px - 30px);
  @media (min-width: 768px) {
    width: 50vw;
    padding: 15px;
  }
}
.display-active.result-mask {
  height: 100vh;
  @media (min-width: 768px) {
    width: 50vw;
  }
}
</style>
