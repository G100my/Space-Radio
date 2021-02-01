<template>
  <div class="sidebar-container">
    <h1>Jukebox</h1>
    <p>Now Playing:</p>
    <div class="track-info">
      <div class="cover">
        <img :src="getCurrentPlayingAlbum.images[0].url" alt="" />
      </div>
      <p class="artists">
        <a
          v-for="(getCurrentPlayingArtists, index) in getCurrentPlayingArtists"
          :key="index"
          :href="getCurrentPlayingArtists.external_urls.spotify"
          >{{ getCurrentPlayingArtists.name }}</a
        >
      </p>
      <p class="album">
        <a :href="getCurrentPlayingAlbum.external_urls.spotify">{{ getCurrentPlayingAlbum.name }}</a>
      </p>
    </div>
    <div class="control-board">
      <div class="volumn-control">
        <img src="../assets/volume.svg" alt="" />
        <div class="progress">
          <div class="bar">
            <p :style="{ width: `${volumeValue}%` }" />
          </div>
        </div>
        <p>{{ volumeValue }}</p>
        <div class="buttons">
          <button type="button" @click="turnDown">-</button>
          <button type="button" @click="turnUp">+</button>
        </div>
      </div>
      <div class="terminate-control">
        <div class="sign">
          <span :class="{ active: dislike > 0 }" />
          <span :class="{ active: dislike > 1 }" />
        </div>
        <p>{{ dislike }}</p>
        <div class="buttons">
          <button v-show="!isVoted" type="button" @click="increaseDislike">terminate</button>
          <button v-show="isVoted" type="button" @click="reduceDislike">cancel</button>
        </div>
      </div>
      <div class="collect">
        <button type="button">collect</button>
      </div>
    </div>
    <div class="log">
      <ul>
        <li />
      </ul>
    </div>
  </div>
</template>
<script>
import { mapState, mapGetters } from 'vuex'

export default {
  data() {
    return {
      isVoted: false,
    }
  },
  computed: {
    ...mapState({
      volumeValue: state => Number.parseInt(state.PlayingState.volume * 100),
      dislike: state => state.PlayingState.dislike,
    }),
    ...mapGetters(['getCurrentPlayingAlbum', 'getCurrentPlayingArtists', 'getCurrentPlayingTrackId']),
  },
  methods: {
    turnUp() {
      this.$store.dispatch('turnUp')
    },
    turnDown() {
      this.$store.dispatch('turnDown')
    },
    increaseDislike() {
      this.isVoted = true
      this.$store.dispatch('increaseDislike')
    },
    reduceDislike() {
      this.isVoted = false
      this.$store.dispatch('reduceDislike')
    },
  },
}
</script>
<style lang="scss">
.sidebar-container {
  .cover {
    font-size: 0;
    img {
      width: 100%;
    }
  }

  .artists,
  .album {
    display: flex;
    justify-content: center;
  }

  .volumn-control {
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    .buttons {
      flex: 0 0 auto;
      height: 30px;
      display: flex;
      align-items: center;
    }
    button {
      height: 25px;
      width: 25px;
    }
    button + button {
      margin-left: 5px;
    }
  }
  .progress {
    flex-basis: 120px;
    font-size: 0;
  }
  .bar {
    height: 6px;
    padding: 3px;
    background-color: lightslategray;
    p {
      height: 100%;
      background-color: orange;
      max-width: 100%;
      transition: width 0.3 ease-in-out;
    }
  }

  .terminate-control {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .sign {
      font-size: 0;
      display: inline-block;
      padding: 4px;
      background-color: lightslategray;
      margin-right: 5px;
      span {
        display: inline-block;
        height: 20px;
        width: 35px;
      }
      span + span {
        margin-left: 4px;
      }
    }
    .buttons {
      margin-left: auto;
    }
    button + button {
      margin-left: 5px;
    }
  }
  .active {
    background-color: orange;
  }
  .collect {
    padding: 10px;
    button {
      width: 100%;
    }
  }
}
</style>
