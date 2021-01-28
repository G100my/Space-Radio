<template>
  <div class="playlists">
    <h1>playlist</h1>
    <ul>
      <li v-for="(playlist, index) in playlistsArray" :key="index">
        <router-link :to="'/PlaylistContent/' + playlist.id" class="playlist">
          <div class="cover"><img :src="playlist.images[playlist.images.length - 1].url" alt="" /></div>
          <div class="detail">
            <p>{{ playlist.name }}</p>
            <p v-if="playlist.description != ''">
              {{ playlist.description }}
            </p>
          </div>
        </router-link>
      </li>
    </ul>
  </div>
</template>
<script>
export default {
  data() {
    return {
      playlistsArray: [],
    }
  },
  created() {
    this.$spotifyAPI.getUserPlaylists().then(result => {
      console.log(result)
      this.playlistsArray = result.items
    })
  },
}
</script>
<style lang="scss">
.playlists {
  .playlist {
    display: flex;
    &:hover {
      filter: none;
      transition-duration: 0.2s;
      transition-property: transform;
      transform: scale(1.01, 1.05);
    }
  }
  .cover {
    font-size: 0;
    margin-right: 10px;
    img {
      height: 64px;
      width: 64px;
    }
  }
  .detail {
    flex: 1;
    align-self: center;
    p:nth-child(2) {
      font-size: 14px;
      margin: 5px 0 0 8px;
    }
  }
}
</style>
