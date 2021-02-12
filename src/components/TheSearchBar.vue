<template>
  <div class="search">
    <input
      type="text"
      autocomplete="off"
      @keydown.prevent.enter="searchHandler"
      @input="searchText = $event.target.value"
    />
    <button type="button" @click="searchHandler">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        class="bi bi-search"
        viewBox="0 0 16 16"
      >
        <path
          d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"
        />
      </svg>
    </button>
    <div class="immediately-result">
      <ul>
        <li v-for="track in tracksResult" :key="track.id">
          <div class="result-track">
            <img :src="track.album.images[track.album.images.length - 1].url" alt="" />
            <div class="track-info">
              <p>{{ track.name }}</p>
              <p>
                <span v-for="(artist, index) in track.artists" :key="index">{{ artist.name }}</span>
              </p>
            </div>
            <div class="buttons">
              <button @click="addHandler(track.id)">
                <!-- prettier-ignore -->
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-circle" viewBox="0 0 16 16">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                </svg>
              </button>
              <button @click="jumpInHandler(track.id)">
                <!-- prettier-ignore -->
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-up-circle" viewBox="0 0 16 16">
                  <path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-7.5 3.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V11.5z"/>
                </svg>
              </button>
            </div>
          </div>
        </li>
      </ul>
      <ul>
        <li v-for="artist in artistsResult" :key="artist.external_ids">
          <p>{{ artist.name }}</p>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      searchText: '',
      result: [],
      tracksResult: [],
      artistsResult: [],
    }
  },
  methods: {
    searchHandler() {
      this.$spotifyAPI
        // fixme
        .search(this.searchText, ['track', 'artist'], { market: 'from_token', limit: 10 })
        .then((success, error) => {
          if (success) {
            console.log('success')
            console.log(success)
            this.tracksResult = success.tracks.items
            this.artistsResult = success.artists.items
          } else {
            console.log('error', error)
          }
        })
    },
    addHandler(trackId) {
      this.$store.dispatch('add', { trackId, message: '' })
    },
    jumpInHandler(trackId) {
      // fixme
      this.$store.dispatch('jumpIn', { id: trackId, message: '' })
    },
  },
}
</script>
<style lang="scss">
.search {
  flex: 1;
  box-sizing: border-box;
  display: flex;
  align-items: stretch;
  border: 2px solid var(--primary-neutral);
  border-radius: var(--border-radius);

  input,
  button {
    background-color: var(--primary-dark);
    border: none;
    &:focus {
      outline: none;
    }
  }
  input {
    flex: 1;
    width: 100%;
    color: var(--primary-light);
    padding: 0 5px;
    font-size: 1.3rem;
  }
  button {
    flex: 0 0 40px;
    border-left: none;
    color: var(--primary-light);
    transform: translateX(-1px);
  }
}

.immediately-result {
  position: absolute;
  top: 100px;
  width: 100%;
  p {
    overflow: hidden;
    text-overflow: ellipsis;
  }
  span {
    font-size: 1rem;
  }
  ul {
    width: 100%;
  }
  li + li,
  ul + ul {
    margin-top: 5px;
  }

  .result-track {
    width: 100%;
    display: flex;
    align-items: center;
    outline: 1px pink dashed;
  }
  .track-info {
    margin-left: 10px;
    max-width: calc(100% - 70px - 85px - 13px);
    p {
      width: 100%;
      white-space: nowrap;
    }
  }
  .buttons {
    flex: 0;
    display: flex;
    margin-left: auto;
    button {
      height: 40px;
      width: 40px;
      flex: 0 0 40px;
      padding: 0;
      font-size: 0;
    }
    button + button {
      margin-left: 5px;
    }
    svg {
      height: 25px;
      width: 25px;
    }
  }
}
</style>
