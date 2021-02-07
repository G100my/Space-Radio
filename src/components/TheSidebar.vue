<template>
  <div class="sidebar">
    <h1>
      <img src="../assets/vinyl-record.png" alt="" />
      <p>Jukebox</p>
    </h1>
    <div class="track-info">
      <div class="cover">
        <img :src="currentPlayingAlbum.images[0].url" alt="" />
      </div>
      <section class="description">
        <p>
          <span>{{ currentPlayingTrackName }}</span>
          <span>
            <a v-for="(artists, index) in currentPlayingArtists" :key="index" :href="artists.external_urls.spotify">
              {{ artists.name }}
            </a>
          </span>
        </p>
        <p>
          <span>
            <a :href="currentPlayingAlbum.external_urls.spotify">{{ currentPlayingAlbum.name }}</a>
          </span>
          <span>{{ currentPlayingAlbum.release_date.slice(0, -3) }}</span>
        </p>
      </section>
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
  computed: {
    ...mapState({
      volumeValue: state => Number.parseInt(state.PlayingState.volume * 100),
      dislike: state => state.PlayingState.dislike,
      isVoted: state => state.PlayingState.isVoted,
    }),
    ...mapGetters(['currentPlayingAlbum', 'currentPlayingArtists', 'currentPlayingTrackId', 'currentPlayingTrackName']),
  },
  methods: {
    turnUp() {
      this.$store.dispatch('turnUp')
    },
    turnDown() {
      this.$store.dispatch('turnDown')
    },
    increaseDislike() {
      this.$store.dispatch('increaseDislike')
    },
    reduceDislike() {
      this.$store.dispatch('reduceDislike')
    },
  },
}
</script>
<style lang="scss">
.sidebar {
  min-height: 100vh;
  padding: 35px 20px 15px;
  box-sizing: border-box;
  h1 {
    display: flex;
    align-items: center;
    img {
      width: 40px;
      margin-right: 15px;
    }
    p {
      margin-right: auto;
    }
  }
  .track-info {
    margin-top: 30px;
    text-align: center;
  }
  .description {
    margin-top: 5px;
    display: flex;
    flex-direction: column;
    text-align: center;

    span + span::before {
      content: '/';
      margin: 0 10px;
    }
    p:first-child > span:first-child {
      font-size: larger;
    }
    p:nth-child(2) {
      margin-top: 5px;
      > span + span {
        font-size: xx-small;
      }
    }
  }
  .cover {
    font-size: 0;
    width: 80%;
    margin: 0 auto;
    img {
      width: 100%;
      max-width: 400px;
    }
  }

  .control-board {
    margin-top: 20px;
  }
  .terminate-control,
  .collect {
    margin-top: 15px;
  }
  .volumn-control,
  .collect,
  .terminate-control {
    padding: 0 30px;
  }
  .volumn-control {
    display: flex;
    align-items: center;
    justify-content: space-between;
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
    button + button {
      margin-left: 5px;
    }
  }
  .active {
    background-color: orange;
  }
  .collect {
    button {
      width: 100%;
    }
  }
}
</style>
