<template>
  <div class="track-cover" :class="{ urgent: isUrgent, pending: isPending }">
    <img :src="coverUrl" alt="" />
  </div>
  <div class="track-name-artist" :class="{ urgent: isUrgent, pending: isPending }">
    <p class="name">
      <a :href="track.external_urls.spotify" target="_blank">{{ track.name }}</a>
    </p>
    <p class="artist">
      <a v-for="artist in track.artists" :key="artist.name" :href="artist.external_urls.spotify" target="_blank">{{
        artist.name
      }}</a>
    </p>
  </div>
  <div class="track-album" :class="{ urgent: isUrgent, pending: isPending }">
    <p>
      <a :href="track.album.external_urls.spotify" target="_blank">{{ track.album.name }}</a>
    </p>
  </div>
  <div class="track-time-data" :class="{ urgent: isUrgent, pending: isPending }">
    <p>
      {{ durationTime }}
    </p>
    <p>{{ release }}</p>
  </div>
  <div class="track-feature" :class="{ urgent: isUrgent, pending: isPending }">
    <slot>
      <p class="pending">pending...</p>
    </slot>
  </div>
</template>
<script>
import logo from '../../assets/vinyl-record.png'
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
    isPending: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      track: {
        name: '',
        album: {
          images: [{ url: logo }],
          release_date: '',
          name: '',
        },
        duration_ms: 123,
        external_urls: { spotify: '##' },
        artists: [
          {
            external_urls: { spotify: '##' },
            name: '',
          },
        ],
      },
    }
  },
  computed: {
    coverUrl() {
      const imagesArray = this.track.album.images
      const imageLastObject = imagesArray[imagesArray.length - 1]

      return imageLastObject ? imageLastObject.url : null
    },
    release() {
      return this.track.album.release_date.slice(0, -3)
    },
    durationTime() {
      const m = Math.floor(this.track.duration_ms / 60000)
      const s = Math.floor((this.track.duration_ms % 60000) / 1000)
      return `${m}:${s}`
    },
  },
  created() {
    this.track = this.info
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
.pending {
  p > a,
  > p,
  button {
    color: var(--primary-neutral);
  }
}
</style>
