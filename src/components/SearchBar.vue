<template>
  <div class="search" :class="{ active: isImmediatelyOpen }">
    <input v-model="searchText" type="text" autocomplete="off" @keydown.prevent.enter="searchHandler" />
    <button class="submit-search-botton" type="button" @click="searchHandler($event), (isImmediatelyOpen = true)">
      <!-- prettier-ignore -->
      <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
      </svg>
    </button>
    <button class="cancel-search-button" type="button" @click="clearSearch">
      <!-- prettier-ignore -->
      <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16">
        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
      </svg>
    </button>
    <div v-show="isImmediatelyOpen" class="immediately-result">
      <template v-if="tracksResult.length === 0">
        <p class="no-result" @click="isImmediatelyOpen = false">No result</p>
      </template>
      <template v-else>
        <ul>
          <li v-for="track in tracksResult" :key="track.id">
            <div class="result-track">
              <img :src="track.album.images[track.album.images.length - 1].url" alt="" />
              <div class="track-info">
                <p>{{ track.name }}</p>
                <p>
                  <a
                    v-for="(artist, index) in track.artists"
                    :key="index"
                    :href="artist.external_urls.spotify"
                    target="_blank"
                    >{{ artist.name }}</a
                  >
                </p>
              </div>
              <div class="buttons">
                <button @click="addHandler(track.id, track.name)">
                  <!-- prettier-ignore -->
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-plus-circle" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                  </svg>
                </button>
                <button @click="jumpInHandler(track.id, track.name)">
                  <!-- prettier-ignore -->
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-arrow-up-circle" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-7.5 3.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V11.5z"/>
                  </svg>
                </button>
              </div>
            </div>
          </li>
        </ul>
      </template>
    </div>
  </div>
</template>
<script>
export default {
  emits: ['activeNoteDialog'],
  data() {
    return {
      searchText: '',
      result: [],
      isImmediatelyOpen: false,
      tracksResult: [],
    }
  },
  watch: {
    isImmediatelyOpen(value) {
      if (!value) {
        this.searchText = ''
      }
    },
  },
  methods: {
    searchHandler() {
      if (this.searchText === '') return
      this.$spotifyAPI.search(this.searchText, ['track'], { market: 'from_token', limit: 10 }, (error, success) => {
        error && console.log(error.response)
        success && (this.tracksResult = success.tracks.items)
      })
    },
    addHandler(trackId, trackName) {
      this.$store.dispatch('add', { id: trackId, note: false, trackName })
    },
    jumpInHandler(trackId, trackName) {
      const submitFunction = newNote => {
        this.$store.dispatch('jumpIn', { id: trackId, note: newNote, trackName })
      }
      this.$emit('activeNoteDialog', { submitFunction })
    },
    clearSearch() {
      this.isImmediatelyOpen = false
      if (this.tracksResult.length != 0) this.tracksResult = []
    },
  },
}
</script>
<style lang="scss">
$icon-length: 35px;

.search {
  margin-right: 10px;
  display: flex;
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
    color: var(--primary-light);
    width: 0;
    padding: 0;
    font-size: 1.3rem;
  }
  .submit-search-botton svg,
  .cancel-search-button svg,
  input {
    vertical-align: middle;
  }
  .submit-search-botton,
  .cancel-search-button,
  input {
    height: $icon-length;
    font-size: 0;
  }

  .submit-search-botton {
    width: $icon-length;
    border-left: none;
    svg {
      width: 70%;
      height: 70%;
    }
  }
  .cancel-search-button {
    overflow: hidden;
    padding: 0;
    svg {
      width: 60%;
      height: 60%;
    }
  }
}

.search,
.search .cancel-search-button,
.search input,
.search ~ ul,
.search ~ h1 {
  transition: all 0.3s ease-in-out;
}

.search,
.search ~ ul,
.search ~ h1 {
  transition-delay: 0.3s;
}

.search input,
.search .cancel-search-button {
  transition-delay: 0s;
}

.search.active,
.search.active ~ ul,
.search.active ~ h1 {
  transition-delay: 0s;
}

.search.active input,
.search.active .cancel-search-button {
  transition-delay: 0.3s;
}

.search {
  flex-basis: 0;
  .cancel-search-button {
    flex-basis: 0;
  }
  ~ h1 {
    margin-right: auto;
  }
  ~ ul,
  ~ h1 {
    flex-shrink: 1;
    overflow: hidden;
    max-width: 200px;
  }
}

.search.active {
  flex-basis: 100%;
  flex-shrink: 0;
  input {
    flex-grow: 1;
  }
  .cancel-search-button {
    flex-basis: $icon-length;
  }

  &::before {
    content: '';
    position: absolute;
    height: 100vh;
    width: 100vw;
    background-color: var(--primary-dark);
    top: 100%;
    left: 0;
    display: block;
  }
  @media (min-width: 768px) {
    &::before {
      width: 100%;
      height: auto;
    }
    input {
      flex-shrink: 0;
    }
  }
}

.immediately-result {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100vw;
  padding: 0 15px;
  box-sizing: border-box;
  overflow-y: auto;

  p {
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--ignore);
    padding: 10px 0;
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

  .no-result {
    height: 100%;
    width: 100%;
    text-align: center;
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
    span:not(span:last-child)::after {
      content: ',';
      margin-right: 5px;
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
