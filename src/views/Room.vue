<template>
  <div class="room" @touchstart="touchstartHandler" @touchmove="touchmoveHandler" @touchend="touchendHandler">
    <nav>
      <SearchBar @activeNoteDialog="activeNoteDialogHandler" />
      <h1>
        <img src="../assets/vinyl-record.png" alt="" />
        <p>Jukebox</p>
      </h1>
      <ul>
        <li>
          <!-- prettier-ignore -->
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-music-note-list" viewBox="0 0 16 16">
                <path d="M12 13c0 1.105-1.12 2-2.5 2S7 14.105 7 13s1.12-2 2.5-2 2.5.895 2.5 2z"/>
                <path fill-rule="evenodd" d="M12 3v10h-1V3h1z"/>
                <path d="M11 2.82a1 1 0 0 1 .804-.98l3-.6A1 1 0 0 1 16 2.22V4l-5 1V2.82z"/>
                <path fill-rule="evenodd" d="M0 11.5a.5.5 0 0 1 .5-.5H4a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5zm0-4A.5.5 0 0 1 .5 7H8a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5zm0-4A.5.5 0 0 1 .5 3H8a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5z"/>
              </svg>
        </li>
      </ul>
    </nav>
    <div ref="slideContainer" class="slide-container">
      <div class="sidebar slide-items">
        <PlayingState />
      </div>
      <div class="view slide-items">
        <router-view @activeNoteDialog="activeNoteDialogHandler" />
        <NoteDialog v-if="isNoteDialogActive" v-bind="editingNote" @finish="dialogFinishHandler" />
      </div>
    </div>
  </div>
</template>
<script>
import PlayingState from '../components/PlayingState.vue'
import { Queue as QueueStore, connect2FirebaseQueue } from '../store/Queue.js'
import SearchBar from '../components/SearchBar.vue'
import NoteDialog from '../components/NoteDialog.vue'

export default {
  components: {
    PlayingState,
    SearchBar,
    NoteDialog,
  },
  data() {
    return {
      isMainSide: true,
      touchStartPosition: 0,
      isNoteDialogActive: false,
      editingNote: {
        queueKey: '',
        trackName: '',
        submitFunction: () => {},
      },
    }
  },
  beforeCreate() {
    if (!this.$store.hasModule('Queue')) {
      this.$store.registerModule('Queue', QueueStore)
      connect2FirebaseQueue(this.$store)
    }
  },
  // for test
  created() {
    if (!this.$spotifyAPI.getAccessToken()) {
      this.$spotifyAPI.setAccessToken(this.$store.getters.token)
    }
  },
  // for test
  mounted() {
    // this.sliderToggler('slide2left')
  },
  methods: {
    activeNoteDialogHandler(note) {
      this.editingNote = { ...note }
      this.isNoteDialogActive = true
    },
    dialogFinishHandler() {
      this.isNoteDialogActive = false
      this.editingNote = {
        queueKey: '',
        trackName: '',
        submitFunction: () => {},
      }
    },
    sliderToggler(direction) {
      switch (direction) {
        case 'slide2right':
          this.$refs.slideContainer.style.transform = ''
          this.isMainSide = true
          break
        case 'slide2left':
          this.$refs.slideContainer.style.transform = `translate(-${window.innerWidth}px, 0)`
          this.isMainSide = false
          break
        case 'resume':
          if (this.isMainSide) {
            this.$refs.slideContainer.style.transform = ''
          } else {
            this.$refs.slideContainer.style.transform = `translate(-${window.innerWidth}px, 0)`
          }
          break
        default:
          console.log('something wrong')
          break
      }
    },
    touchstartHandler(event) {
      this.touchStartPosition = event.touches[0].clientX
    },
    touchendHandler(event) {
      const endPosition = event.changedTouches[0].clientX

      if (this.touchStartPosition - endPosition > 70) {
        this.sliderToggler('slide2left')
      } else if (endPosition - this.touchStartPosition > 70) {
        this.sliderToggler('slide2right')
      } else {
        this.sliderToggler('resume')
      }
    },
    touchmoveHandler(event) {
      // left: -,   right: +
      const currentDistance = event.touches[0].clientX - this.touchStartPosition
      if (this.isMainSide) {
        if (currentDistance > 30) {
          return
        } else {
          this.$refs.slideContainer.style.transform = `translate(${currentDistance}px, 0)`
        }
      } else {
        if (currentDistance < -30) {
          return
        } else {
          this.$refs.slideContainer.style.transform = `translate(${-window.innerWidth + currentDistance}px, 0)`
        }
      }
    },
  },
}
</script>
<style lang="scss">
.room {
  overflow: hidden;
  flex: 0 0 fit-content;
  @media (min-width: 768px) {
    overflow-y: hidden;
  }

  .slide-container {
    display: flex;
    transition: transform 0.1s ease-in-out;
  }
  .slide-items {
    flex-shrink: 0;
    height: 100vh;
    width: 100%;
    box-sizing: border-box;
    padding: 80px 0 60px;
    @media (min-width: 768px) {
      padding: 0;
    }
  }
  .view.slide-items {
    display: flex;
    flex-direction: column;
    @media (min-width: 768px) {
      width: auto;
      flex: 1;
    }
  }
  .sidebar {
    padding-right: 20px;
    padding-left: 20px;
    box-sizing: border-box;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    .playing-state {
      flex: 1;
    }
    @media (min-width: 768px) {
      width: 400px;
      padding-bottom: 40px;
      padding-top: 40px;
    }
  }
}
nav {
  margin: 0 var(--edge-gap);
  padding: var(--edge-gap) 0;
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  h1 {
    order: -1;
    display: flex;
    align-items: center;
    img {
      width: 30px;
      margin-right: 5px;
    }
    @media (min-width: 768px) {
      display: none;
    }
  }

  > ul {
    display: flex;
    font-size: 0;
    justify-content: flex-end;
    li {
      height: 45px;
      width: 45px;
      border: 2px solid var(--primary-highlight);
      border-radius: 4px;
      padding: 5px;
      box-sizing: border-box;
    }
    li + li {
      margin-left: 15px;
    }
    svg {
      height: 100%;
      width: 100%;
    }
  }
}
</style>
