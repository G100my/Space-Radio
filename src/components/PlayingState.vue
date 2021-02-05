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
    <slot />
    <div class="log">
      <ul>
        <li />
      </ul>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters(['getCurrentPlayingAlbum', 'getCurrentPlayingArtists']),
  },
}
</script>
