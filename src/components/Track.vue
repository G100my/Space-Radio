<template>
  <div class="track">
    <div class="cover">
      <img :src="coverUrl" alt="" />
    </div>
    <div class="base-info">
      <p class="name">
        <a :href="info.external_urls.spotify">{{ info.name }}</a>
      </p>

      <p class="artist">
        <a v-for="artist in info.artists" :key="artist.name" :href="artist.external_urls.spotify">{{ artist.name }}</a>
      </p>

      <p class="album">
        <a :href="info.album.external_urls.spotify">{{ info.album.name }}</a>
      </p>
      <section class="time-data">
        <p>
          <label>Duration Time:</label>
          <span class="number">{{ durationTime }}</span>
        </p>
        <p>
          <label>Release:</label>
          <span class="number">{{ release }}</span>
        </p>
      </section>
    </div>
    <slot />
  </div>
</template>
<script>
export default {
  props: {
    info: {
      type: Object,
      required: true,
    },
  },
  computed: {
    coverUrl() {
      const imagesArray = this.info.album.images
      const imageLastObject = imagesArray[imagesArray.length - 1]

      return imageLastObject ? imageLastObject.url : null
    },
    release() {
      return this.info.album.release_date.slice(0, -3)
    },
    durationTime() {
      const m = Math.floor(this.info.duration_ms / 60000)
      const s = Math.floor((this.info.duration_ms % 60000) / 1000)
      return `${m}:${s}`
    },
  },
}
</script>
<style lang="scss">
.track {
  $margin-gap: 10px;

  display: flex;
  align-items: center;
  padding: 15px;
  font-size: 14px;

  label {
    font-size: 12px;
  }
  section {
    padding: 0 5px;
  }

  .cover {
    display: flex;
    align-items: center;
    margin-right: $margin-gap;
    img {
      height: 64px;
      width: 64px;
    }
  }

  .base-info {
    flex: 1;
    display: grid;
    grid-template-areas:
      'name album time feature'
      'artist album time feature';
    grid-template-columns: 1fr 1fr auto 50px;
  }
  .name {
    grid-area: name;
  }
  .artist {
    grid-area: artist;
  }
  .album {
    grid-area: album;
  }
  .time-data {
    grid-area: time;
  }
  .feature {
    grid-area: feature;
  }

  .name a {
    font-size: 18px;
    font-weight: 600;
  }

  .artist > a:not(:last-child)::after {
    content: ',';
    margin-right: 5px;
  }

  .album,
  .time-data,
  .feature {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .time-data > p {
    display: flex;
    justify-content: space-between;
  }
  .number {
    font-size: 12px;
    margin-left: 8px;
  }
}
</style>
