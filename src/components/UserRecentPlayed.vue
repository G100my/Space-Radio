<template>
  <div class="user-recent-played">
    <TrackGridShell>
      <template #header>
        <h2>User Recent Played</h2>
      </template>
      <template #body>
        <TrackGridItem v-for="track in trackList" :key="track.id" :info="track">
          <div class="feature-buttons">
            <AddButton :track-id="track.id" :track-name="track.name" />
            <JumpInButton :track-id="track.id" :track-name="track.name" />
          </div>
        </TrackGridItem>
      </template>
    </TrackGridShell>
  </div>
</template>
<script>
import TrackGridItem from './template/TrackGridItem.vue'
import TrackGridShell from './template/TrackGridShell.vue'
import AddButton from './featureButtons/AddButton.vue'
import JumpInButton from './featureButtons/JumpInButton.vue'

export default {
  components: {
    TrackGridItem,
    TrackGridShell,
    AddButton,
    JumpInButton,
  },
  data() {
    return {
      trackList: null,
    }
  },
  created() {
    this.$spotifyAPI.getMyRecentlyPlayedTracks({ limit: 50 }).then(result => {
      if (!result.error) {
        console.log(result)
        this.trackList = result.items.map(item => item.track)
      }
    })
  },
}
</script>
<style lang="scss">
.user-recent-played {
  flex: 0 1 0px;
  transition: flex 0.3s ease-in-out;
  overflow-y: auto;
  height: 100%;
  position: relative;

  .track-album,
  .track-name-artist {
    > p {
      @media (min-width: 768px) {
        max-width: 200px;
      }
    }
    > a {
      overflow: inherit;
      text-overflow: inherit;
    }
  }
}
.recent-active {
  .room-queue {
    flex: 1 1 0%;
  }
  .user-recent-played {
    flex: 1 1 0%;
    border-left: 2px var(--primary-highlight) solid;
  }
}
</style>
