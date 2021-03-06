<template>
  <div class="search">
    <input v-model="searchText" type="text" autocomplete="off" @keydown.prevent.enter="searchHandler" />
    <button class="submit-search-botton" type="button" @click="searchHandler">
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
  </div>
</template>
<script>
export default {
  emits: ['triggerAdditionDisplay', 'triggerSearchStyle', 'updateAdditionDisplaySource'],
  data() {
    return {
      searchText: '',
      searchResult: [],
      trigger: false,
    }
  },
  methods: {
    searchHandler() {
      console.log(this.trigger)
      this.$emit('triggerAdditionDisplay', true)
      this.$emit('updateAdditionDisplaySource', this.searchResult)
      if (this.trigger) {
        if (this.searchText === '') return
        this.$spotifyAPI.search(this.searchText, ['track'], { market: 'from_token', limit: 10 }, (error, success) => {
          error && console.log(error.response)
          this.searchResult = success.tracks.items
          if (success) {
            this.$emit('updateAdditionDisplaySource', this.searchResult)
          }
        })
      } else {
        this.trigger = true
        this.$emit('triggerSearchStyle', this.trigger)
      }
    },
    clearSearch() {
      this.trigger = false
      this.searchText = ''
      this.$emit('triggerSearchStyle', false)
      this.$emit('triggerAdditionDisplay', false)
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
    height: $icon-length;
  }
  .submit-search-botton svg,
  .cancel-search-button svg,
  input {
    vertical-align: middle;
  }
  .submit-search-botton,
  .cancel-search-button {
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

.search .cancel-search-button,
.search {
  transition: flex 0.3s ease-in-out, margin-right 0.3s ease-in-out;
}
.search input {
  transition: flex 0.3s ease-in-out, padding-left 0.3s ease-in-out;
}
.search ~ h1 {
  transition: flex 0.3s ease-in-out;
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

.active-search {
  .search,
  .search ~ ul,
  .search ~ h1 {
    transition-delay: 0s;
  }

  .search input,
  .search .cancel-search-button {
    transition-delay: 0.3s;
  }
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
    overflow: hidden;
  }
}

.active-search .search {
  flex-basis: 100%;
  flex-shrink: 0;
  margin-right: 0;

  input {
    flex-grow: 1;
    padding-left: 10px;
  }
  .cancel-search-button {
    flex-basis: $icon-length;
  }
}

.active-search {
  nav {
    flex-basis: 100%;
    @media (min-width: 768px) {
      flex-basis: 50%;
    }
  }
}
</style>
