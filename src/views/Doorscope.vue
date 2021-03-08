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
      <div class="others">
        <h2>Now playing:</h2>
        <div class="track-info">
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
            <a target="_blank" :href="playerPlayingAlbum.url">{{ playerPlayingAlbum.name }}</a>
          </p>
        </div>
        <div class="log">
          <UserLog />
        </div>
        <div class="login">
          <button type="button" @click="PKCE">Spotify Login</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { PKCE } from '../utility/PKCE.js'
import UserLog from '../components/UserLog.vue'
import logo from '../assets/vinyl-record.png'

export default {
  components: {
    UserLog,
  },
  data() {
    return { logo }
  },
  computed: {
    ...mapGetters(['playerPlayingAlbum', 'playerPlayingArtists', 'playerPlayingTrackName']),
  },
  methods: {
    PKCE,
  },
}
</script>
<style lang="scss">
.doorscope {
  height: fit-content;
  padding: 30px 20px;
  box-sizing: content-box;
  align-self: center;

  .title > h1 {
    font-size: 65px;
    text-align: center;
  }
  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .cover-container {
    display: flex;
    align-items: center;
    padding: 30px;
  }
  .cover {
    height: fit-content;
    max-width: 250px;
    font-size: 0;
    position: relative;
    // transform: skewX(-3deg) rotateY(10deg);
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
      border: 10px solid black;
      --length: 20%;
      width: var(--length);
      height: var(--length);
      background: radial-gradient(circle at center, white 0 13%, rgba(51, 146, 255, 0.625) 15% 100%);
    }
  }
  .others {
    display: flex;
    flex-direction: column;
  }
  .track-info {
    margin: 20px 0 0;
    display: grid;
    grid-template-columns: auto 2fr;
    grid-template-rows: 1fr 1fr 1fr;
    gap: 5px;
    align-items: flex-end;

    p:nth-child(2) {
      font-size: larger;
    }
    p:nth-child(2n + 1) {
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
  .login {
    margin-top: 30px;
    display: flex;
    justify-content: center;
    button {
      font-size: 23px;
      padding: 8px 20px;
      border-radius: 10px;
      color: var(--secondary-neutral);
      &:focus {
        outline: none;
      }
    }
  }

  @media (min-width: 768px) {
    & {
      max-width: 1000px;
      margin: 60px auto;
      border: 8px outset var(--secondary-neutral);
      box-sizing: border-box;
      padding: 40px 65px 40px;
      flex: 1;
    }
    .title > h1 {
      text-align: left;
    }
    .content {
      margin-top: 45px;
      flex-direction: row;
      flex-flow: wrap;
    }
    .others {
      flex: 1 1 auto;
    }
    .cover-container {
      padding: 0;
      padding-right: 80px;
    }
    .cover {
      max-width: 350px;
    }
  }
}
</style>
