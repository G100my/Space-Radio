<template>
  <div class="doorscope">
    <div class="title">
      <h1>Jukebox</h1>
    </div>
    <div class="content">
      <div class="cover-container">
        <div class="cover">
          <img :src="playerPlayingAlbum.image_url ? playerPlayingAlbum.image_url : logo" alt="" />
        </div>
      </div>
      <div class="room-info">
        <div class="room-name">
          <p>Room name:</p>
          <h2 :class="{ ignore: !targetRoomName }">{{ targetRoomName ? targetRoomName : '- - -' }}</h2>
        </div>
        <div class="track-info">
          <h3>Now playing</h3>
          <p>Track Name:</p>
          <p>{{ playerPlayingTrackName }}</p>
          <p>Artists:</p>
          <p>
            <a v-for="(artist, index) in playerPlayingArtists" :key="index" target="_blank" :href="artist.url">{{
              artist.name
            }}</a>
          </p>
          <p>Album:</p>
          <p>
            <a
              target="_blank"
              :class="{ 'link-disable': playerPlayingAlbum.url === '' }"
              :href="playerPlayingAlbum.url"
              >{{ playerPlayingAlbum.name }}</a
            >
          </p>
        </div>
        <div class="log">
          <UserLog />
        </div>
        <div class="feature">
          <template v-if="!$route.params.roomKey">
            <p>Please enter room key or room name</p>
            <div class="search-room">
              <input
                v-model="searchKeyWordInput"
                type="text"
                placeholder="search room key or name"
                @keydown.prevent.enter="searchRoomKey"
              />
              <button type="button" @click="searchRoomKey">
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
                  <path
                    d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"
                  />
                </svg>
              </button>
            </div>
          </template>
          <div class="buttons">
            <button class="login-botton" :disabled="!targetRoomName" type="button" @click="PKCE('#room')">
              Spotify Login
            </button>
            <button v-if="!$route.params.roomKey" type="button" @click="PKCE('#create')">Create Room</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import firebase from '../store/firebase.js'
import { PKCE } from '../utility/PKCE.js'
import UserLog from '../components/UserLog.vue'
import logo from '../assets/vinyl-record.png'

export default {
  components: {
    UserLog,
  },
  data() {
    return {
      logo,
      targetRoomName: '',
      roomListObject: {},
      searchKeyWordInput: '',
    }
  },
  computed: {
    ...mapGetters(['playerPlayingAlbum', 'playerPlayingArtists', 'playerPlayingTrackName']),
  },
  beforeCreate() {
    const pathRoomKey = this.$route.params.roomKey
    firebase
      .database()
      .ref('room_list')
      .get()
      .then(snapshot => {
        this.roomListObject = snapshot.val()

        if (pathRoomKey) {
          const hasRoom = Object.prototype.hasOwnProperty.call(this.roomListObject, pathRoomKey)

          if (hasRoom) {
            this.fetchRoomBasicInfo(pathRoomKey)
            localStorage.setItem('jukebox_room_key', pathRoomKey)
          } else {
            this.$router.push({ name: 'Lobby' })
          }
        }
      })
  },
  methods: {
    PKCE,
    searchRoomKey() {
      let targetRoomKey
      // 可以搜尋 room key 或者搜尋 room name
      if (Object.prototype.hasOwnProperty.call(this.roomListObject, this.searchKeyWordInput)) {
        targetRoomKey = this.searchKeyWordInput
      } else {
        for (let key in this.roomListObject) {
          if (this.roomListObject[key] === this.searchKeyWordInput) {
            targetRoomKey = key
            break
          }
        }
      }
      if (targetRoomKey) {
        localStorage.setItem('jukebox_room_key', targetRoomKey)
        this.fetchRoomBasicInfo(targetRoomKey)
      } else {
        console.log('no result')
        localStorage.setItem('jukebox_room_key', targetRoomKey)
        this.$store.commit('refreshPlayerTrack', null)
        this.targetRoomName = ''
      }
    },
    fetchRoomBasicInfo(roomKey) {
      const room_ref = firebase.database().ref(roomKey)
      room_ref
        .child('playing_state')
        .get()
        .then(snapshot => {
          const playingTrack = snapshot.val()['playing_track']
          this.$store.commit('refreshPlayerTrack', playingTrack)
        })
      room_ref
        .child('basic/room_name')
        .get()
        .then(snapshot => {
          this.targetRoomName = snapshot.val()
        })
    },
  },
}
</script>
<style lang="scss">
.doorscope {
  height: fit-content;
  padding: 5px 20px;
  box-sizing: content-box;
  align-self: center;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;

  .title {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    > h1 {
      font-size: 3rem;
      text-align: center;
    }
  }

  .content {
    display: flex;
    flex-direction: column;
    flex: 4;
  }
  .cover-container {
    display: flex;
    justify-content: center;
    padding: 15px;
  }
  .cover {
    height: 25vh;
    width: 25vh;
    font-size: 0;
    position: relative;
    filter: drop-shadow(15px 15px 8px black);

    img {
      width: 100%;
      border-radius: 50%;
      border: 5px black double;
      background-color: lightslategray;
      box-sizing: border-box;
      z-index: 10;
      animation: 10s linear 0s infinite normal rotate;
    }
    @keyframes rotate {
      from {
        transform: rotate(0turn);
      }
      to {
        transform: rotate(1turn);
      }
    }

    &::before,
    &::after {
      content: '';
      position: absolute;
      border-radius: 50%;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      margin: auto;
      display: block;
      height: 100%;
      width: 100%;
      z-index: 100;
    }
    &::before {
      @function radial($start, $end, $circle-width) {
        @return transparent $start * 10px ($end * 10px - $circle-width * 1px),
          black ($end * 10px - $circle-width * 1px) $end * 10px;
      }
      background: radial-gradient(
        circle at center,
        radial(5, 8, 1),
        radial(8, 11, 2),
        radial(11, 14, 1),
        radial(14, 18, 1),
        radial(18, 19, 2),
        radial(19, 25, 1)
      );
    }
    &::after {
      $length: 20%;
      border: 10px solid black;
      width: $length;
      height: $length;
      background: radial-gradient(circle at center, white 0 13%, rgba(51, 146, 255, 0.625) 15% 100%);
    }
  }
  .room-info {
    padding: 0 30px;
    display: flex;
    flex-direction: column;
    flex: 1;
    justify-content: space-evenly;

    h3 {
      margin-top: 0;
      margin-bottom: 5px;
      font-size: 1rem;
      grid-column: 1/3;
      color: var(--primary-neutral);
    }
  }
  .room-name {
    display: flex;
    flex-wrap: wrap;
    font-weight: bold;
    font-size: 1.2rem;
    h2 {
      color: var(--primary-highlight);
      display: inline;
      text-align: center;
      margin-left: auto;
    }
    h2.ignore {
      color: var(--ignore);
      font-size: 1rem;
      text-align: right;
    }
  }
  .track-info {
    margin-top: 5px;
    display: grid;
    grid-template-columns: minmax(auto, 1fr) 1fr;
    grid-template-rows: 1fr;
    column-gap: 20px;
    align-items: flex-end;
    p {
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }

    p:nth-child(2n) {
      color: var(--primary-neutral);
    }
  }
  .log {
    display: none;
    @media (min-width: 768px) {
      margin-top: 30px;
      display: block;
    }
  }
  .feature {
    margin-top: 15px;
    p {
      font-size: 0.5rem;
      color: var(--ignore);
    }
    .search-room {
      display: flex;
      margin-top: 3px;
      height: 35px;
      input {
        color: white;
        padding-left: 10px;
        flex: 1;
        background-color: inherit;
        border: 1px solid var(--primary-highlight);
        border-right: none;
        border-top-left-radius: var(--border-radius);
        border-bottom-left-radius: var(--border-radius);
        &:focus {
          outline: none;
        }
      }
      button {
        border-left: none;
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }
    }
    .buttons {
      margin-top: 10px;
      display: flex;
      flex-direction: column;

      button {
        font-size: 1.2rem;
        padding: 5px 15px;
        border-radius: 10px;
        color: var(--secondary-neutral);
        &:focus {
          outline: none;
        }
      }

      button + button {
        margin-top: 10px;
      }
      .login-botton:disabled {
        color: var(--ignore);
      }
    }
  }

  @media (min-width: 768px) {
    & {
      max-width: 1000px;
      margin: 60px auto;
      border: 8px outset var(--secondary-neutral);
      padding: 40px 65px 40px;
      flex: 1;
      min-height: fit-content;
    }
    .title > h1 {
      text-align: left;
    }
    .content {
      margin-top: 45px;
      flex-direction: row;
      flex-flow: wrap;
      justify-content: center;
    }
    .room-info {
      flex: 1 1 auto;
    }
    .cover-container {
      padding: 0;
      padding-right: 80px;
    }
    .cover {
      height: 300px;
      width: 300px;
    }
    .track-info {
      grid-template-columns: minmax(auto, 1fr) 2fr;
      p:nth-child(2n + 1) {
        justify-self: flex-end;
      }
    }
  }
  .link-disable {
    pointer-events: none;
  }
}
</style>
