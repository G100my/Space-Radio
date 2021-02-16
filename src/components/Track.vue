<template>
  <div class="track-cover" :class="{ urgent: isUrgent }">
    <img :src="coverUrl" alt="" />
  </div>
  <div class="track-name-artist" :class="{ urgent: isUrgent }">
    <p class="name">
      <a :href="info.external_urls.spotify" target="_blank">{{ info.name }}</a>
    </p>
    <p class="artist">
      <a v-for="artist in info.artists" :key="artist.name" :href="artist.external_urls.spotify" target="_blank">{{
        artist.name
      }}</a>
    </p>
  </div>
  <div class="track-album" :class="{ urgent: isUrgent }">
    <p>
      <a :href="info.album.external_urls.spotify" target="_blank">{{ info.album.name }}</a>
    </p>
  </div>
  <div class="track-time-data" :class="{ urgent: isUrgent }">
    <p>
      {{ durationTime }}
    </p>
    <p>{{ release }}</p>
  </div>
  <div class="track-feature" :class="{ urgent: isUrgent }">
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
    isUrgent: {
      type: Boolean,
      default: false,
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
.track-cover,
.track-feature,
.track-album,
.track-name-artist,
.track-time-data,
.track-feature {
  align-self: center;
}
.track-cover {
  justify-self: center;
}
.track-time-data {
  justify-self: flex-end;
}
.track-feature {
  justify-self: center;
}

.track-album,
.track-time-data {
  display: none;
  @media (min-width: 768px) {
    display: initial;
  }
}

.track-cover {
  font-size: 0;
  img {
    height: 64px;
    width: 64px;
  }
}

.track-name-artist {
  display: flex;
  flex-direction: column;
  @media (min-width: 768px) {
    display: flex;
    > p {
      flex: 1;
    }
  }
  > a,
  > p {
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .name {
    margin-bottom: 3px;
    > a {
      white-space: nowrap;
      font-size: 1.5em;
      font-weight: 600;
    }
  }
  .artist {
    display: flex;
    flex-direction: column;
    > a:not(:last-child)::after {
      content: ',';
      margin-right: 5px;
    }
    @media (min-width: 768px) {
      flex-direction: row;
    }
  }
}

.track-time-data {
  font-size: smaller;
  text-align: right;
}

.urgent {
  p > a,
  > p,
  button {
    color: var(--primary-highlight);
  }
}
</style>
