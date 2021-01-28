<template>
  <tr class="track">
    <td class="cover">
      <div>
        <img :src="coverUrl" alt="" />
      </div>
    </td>
    <td>
      <p class="name">
        <a :href="info.external_urls.spotify">{{ info.name }}</a>
      </p>
      <p class="artist">
        <a v-for="artist in info.artists" :key="artist.name" :href="artist.external_urls.spotify">{{ artist.name }}</a>
      </p>
    </td>
    <td>
      <p class="album">
        <a :href="info.album.external_urls.spotify">{{ info.album.name }}</a>
      </p>
    </td>
    <td>
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
    </td>
    <td>
      <slot />
    </td>
  </tr>
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

  font-size: 14px;

  label {
    font-size: 12px;
  }
  td {
    vertical-align: middle;
  }

  .cover {
    margin-right: $margin-gap;
    font-size: 0;
    height: 100%;
    img {
      height: 64px;
      width: 64px;
    }
  }

  .name a {
    white-space: nowrap;
    font-size: 18px;
    font-weight: 600;
  }
  .artist > a:not(:last-child)::after {
    content: ',';
    margin-right: 5px;
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
