<template>
  <div class="playing-state">
    <h1>
      <img src="../assets/vinyl-record.png" alt="" />
      <p>Jukebox</p>
    </h1>
    <div class="track-info">
      <div class="cover">
        <img :src="playerPlayingAlbum.image_url ? playerPlayingAlbum.image_url : logo" alt="" />
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
        <template v-if="currentDislikeCountdown">
          <p>將於 {{ currentDislikeCountdown }} 秒後跳過目前歌曲</p>
        </template>
        <template v-else>
          <div class="sign">
            <span v-for="(i, index) in currentDislikeThreshold" :key="i" :class="{ active: currentDislike > index }" />
          </div>
          <p class="currentDislike">{{ currentDislike }}</p>
        </template>
        <div class="buttons">
          <button v-show="!isVoted" type="button" @click="increaseDislike">Terminate</button>
          <button v-show="isVoted" type="button" @click="reduceDislike">Cancel</button>
        </div>
      </div>
      <div class="collect">
        <form>
          <label for="playlist">收集到播放清單:</label>
          <select id="playlist" v-model="selectedPlaylistKey">
            <option
              v-for="(playlist, index) in userPlaylists"
              :key="playlist.id"
              :value="playlist.id"
              :selected="index === 0"
              :label="playlist.name"
              :class="{ selected: playlist.id === selectedPlaylistKey }"
            />
          </select>
        </form>
        <div class="buttons">
          <button
            :disabled="!playerPlayingTrackId"
            type="button"
            class="heart-button"
            @click="!isTrackSaved && add2savedHandler($event), isTrackSaved && removeFromSavedHandler($event)"
          >
            <svg
              v-show="!isTrackSaved"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              class="bi bi-heart"
              viewBox="0 0 16 16"
            >
              <path
                d="M8 2.748l-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"
              />
            </svg>
            <svg
              v-show="isTrackSaved"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              class="bi bi-heart-fill"
              viewBox="0 0 16 16"
            >
              <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z" />
            </svg>
          </button>
          <button :disabled="!playerPlayingTrackId" type="button" class="collect-button" @click="collectHandler">
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-save" viewBox="0 0 16 16">
              <path
                d="M2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H9.5a1 1 0 0 0-1 1v7.293l2.646-2.647a.5.5 0 0 1 .708.708l-3.5 3.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L7.5 9.293V2a2 2 0 0 1 2-2H14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h2.5a.5.5 0 0 1 0 1H2z"
              />
            </svg>
          </button>
        </div>
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
import logo from '../assets/vinyl-record.png'

export default {
  components: {
    UserLog,
    HostControl: defineAsyncComponent(() => import('../components/HostControl.vue')),
  },
  data() {
    return {
      logo,
      userPlaylists: [],
      selectedPlaylistKey: null,
      isTrackSaved: false,
    }
  },
  computed: {
    hostToggler() {
      return this.userId === this.hostId
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
      'currentDislikeCountdown',
      'userId',
      'hostId',
    ]),
  },
  watch: {
    playerPlayingTrackId(newTrackId) {
      if (!newTrackId) return
      this.checkSavedTrackState(newTrackId)
    },
  },
  beforeCreate() {
    this.$spotifyAPI.getUserPlaylists(this.userId, { limit: 50 }).then(result => {
      this.userPlaylists = result.items

      this.selectedPlaylistKey = localStorage.getItem('jukebox_previous_playlise_key') || this.userPlaylists[0].id
    })
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
    collectHandler() {
      console.log()
      this.$spotifyAPI
        .addTracksToPlaylist(this.selectedPlaylistKey, [`spotify:track:${this.playerPlayingTrackId}`])
        .then(result => {
          console.log(result)
          localStorage.setItem('jukebox_previous_playlise_key', this.selectedPlaylistKey)
        })
    },
    add2savedHandler() {
      this.$spotifyAPI.addToMySavedTracks([this.playerPlayingTrackId]).then(() => {
        this.checkSavedTrackState(this.playerPlayingTrackId)
      })
    },
    removeFromSavedHandler() {
      this.$spotifyAPI.removeFromMySavedTracks([this.playerPlayingTrackId]).then(() => {
        this.checkSavedTrackState(this.playerPlayingTrackId)
      })
    },
    checkSavedTrackState(trackId) {
      this.$spotifyAPI.containsMySavedTracks([trackId]).then(result => {
        this.isTrackSaved = result[0]
      })
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
        max-height: 20vh;
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
    form {
      display: flex;
      margin: 15px 0;
      justify-content: space-between;
    }
    select {
      color: var(--secondary-neutral);
      background-color: var(--secondary-dark);
      padding: 2px;
      border-radius: var(--border-radius);
      border-color: var(--primary-highlight);
      width: 100%;
      @media (min-width: 768px) {
        max-width: 180px;
        width: min-content;
      }
    }
    option {
      background-color: var(--secondary-dark);
      color: var(--primary-light);
    }
    .selected {
      color: var(--secondary-neutral);
    }
    label {
      display: none;
      @media (min-width: 768px) {
        display: initial;
      }
    }

    .buttons {
      display: flex;
      button {
        flex: 1;
        padding: 8px 0;
        &:disabled {
          color: darkgray;
        }
      }
      button + button {
        margin-left: 15px;
      }
      svg {
        height: 25px;
        width: 25px;
      }
    }
  }
}
</style>
