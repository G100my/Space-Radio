<template>
  <div class="playing-state">
    <h1>
      <img src="../assets/vinyl-record.png" alt="" />
      <p>Jukebox</p>
    </h1>
    <div class="track-info">
      <div class="cover">
        <img :src="playerPlayingAlbum.image_url" alt="" />
      </div>
      <section class="description">
        <p class="track-name">
          <span>{{ playerPlayingTrackName }}</span>
        </p>
        <p class="artists">
          <a v-for="(artists, index) in playerPlayingArtists" :key="index" target="_blank" :href="artists.url">
            {{ artists.name }}
          </a>
        </p>
        <p class="album">
          <a target="_blank" :href="playerPlayingAlbum.url">{{ playerPlayingAlbum.name }}</a>
        </p>
      </section>
    </div>
    <div class="control-board">
      <div class="volumn-control">
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-volume-down" viewBox="0 0 16 16">
          <path
            d="M9 4a.5.5 0 0 0-.812-.39L5.825 5.5H3.5A.5.5 0 0 0 3 6v4a.5.5 0 0 0 .5.5h2.325l2.363 1.89A.5.5 0 0 0 9 12V4zM6.312 6.39L8 5.04v5.92L6.312 9.61A.5.5 0 0 0 6 9.5H4v-3h2a.5.5 0 0 0 .312-.11zM12.025 8a4.486 4.486 0 0 1-1.318 3.182L10 10.475A3.489 3.489 0 0 0 11.025 8 3.49 3.49 0 0 0 10 5.525l.707-.707A4.486 4.486 0 0 1 12.025 8z"
          />
        </svg>
        <div class="progress">
          <div class="bar">
            <p :style="{ width: `${currentVolume}%` }" />
          </div>
        </div>
        <p>{{ currentVolume }}</p>
        <div class="buttons">
          <button type="button" @click="turnDown">-</button>
          <button type="button" @click="turnUp">+</button>
        </div>
      </div>
      <div class="terminate-control">
        <div class="sign">
          <span v-for="(i, index) in currentDislikeThreshold" :key="i" :class="{ active: currentDislike > index }" />
        </div>
        <p class="currentDislike">{{ currentDislike }}</p>
        <div class="buttons">
          <button v-show="!isVoted" type="button" @click="increaseDislike">Terminate</button>
          <button v-show="isVoted" type="button" @click="reduceDislike">Cancel</button>
        </div>
      </div>
      <div class="collect">
        <button type="button">Collect</button>
      </div>
    </div>
    <div class="log">
      <UserLog />
    </div>
    <HostControl v-if="hostToggler" />
  </div>
</template>
<script>
import { defineAsyncComponent } from 'vue'
import { mapState, mapGetters } from 'vuex'
import UserLog from './UserLog.vue'

export default {
  components: {
    UserLog,
    HostControl: defineAsyncComponent(() => import('../components/HostControl.vue')),
  },
  computed: {
    hostToggler() {
      return this.$store.getters.userId === 'zhanglo'
    },
    ...mapState({
      isVoted: state => state.PlayingState.isVoted,
    }),
    ...mapGetters([
      'playerPlayingAlbum',
      'playerPlayingArtists',
      'playerPlayingTrackId',
      'playerPlayingTrackName',
      'currentVolume',
      'currentDislike',
      'currentDislikeThreshold',
    ]),
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
.playing-state {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  h1 {
    display: none;
    @media (min-width: 768px) {
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
  }
  .track-info {
    // flex: 1;
    display: flex;
    flex-direction: column;
    .cover {
      font-size: 0;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      img {
        max-height: 30vh;
      }
    }
    @media (min-width: 768px) {
      justify-content: flex-end;
      .cover {
        margin: auto;
      }
    }
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
    .track-name {
      font-size: larger;
    }
    .artists {
      margin-top: 5px;
      > a + a::before {
        content: ',';
        margin-right: 5px;
      }
    }
  }

  .track-info {
    margin: 0 30px;
    @media (min-width: 768px) {
      margin: 15px 30px 0;
    }
  }
  .control-board,
  .log,
  .main-control {
    margin: 15px 30px 0;
  }
  .terminate-control,
  .collect {
    margin-top: 15px;
  }

  .control-board {
    & button {
      color: var(--secondary-neutral);
    }
  }
  .volumn-control {
    display: flex;
    align-items: center;
    justify-content: space-between;
    svg {
      height: 30px;
      width: 30px;
    }
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
    padding: 5px;
    border: 1px solid var(--ignore);
    border-radius: var(--border-radius);
    p {
      height: 100%;
      background-color: var(--primary-neutral);
      max-width: 100%;
      transition: width 0.3 ease-in-out;
    }
  }
  .terminate-control {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .sign {
      border: 1px solid var(--ignore);
      border-radius: var(--border-radius);
      font-size: 0;
      display: inline-flex;
      padding: 4px;
      span {
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
    .currentDislike {
      margin: 0 5px;
    }
  }
  .sign > .active {
    background-color: var(--primary-neutral);
  }
  .collect {
    button {
      width: 100%;
    }
  }
}
</style>
