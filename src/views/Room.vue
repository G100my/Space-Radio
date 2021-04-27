<template>
  <div class="room" @touchstart="touchstartHandler" @touchmove="touchmoveHandler" @touchend="touchendHandler">
    <Header />
    <div ref="slideContainer" class="slide-container">
      <div class="sidebar slide-items">
        <PlayingState />
      </div>
      <div class="view slide-items">
        <RoomQueue @activeNoteDialog="activeNoteDialogHandler" />
        <!-- <AdditionDisplay
          v-if="!mobileMode"
          v-show="additionDisplayToggler"
          :source="additionDisplaySource"
          @activeNoteDialog="activeNoteDialogHandler"
          @disactiveSearchStyle="isSearchActive = false"
        /> -->
      </div>
    </div>
    <NoteDialog v-if="isNoteDialogActive" v-bind="editingNote" @finish="dialogFinishHandler" />
    <div class="slide-navigation">
      <span class="sidebar-navigation" :class="{ active: isMainSide }" @click="sliderToggler('slide2right')" />
      <span class="view-navigation" :class="{ active: !isMainSide }" @click="sliderToggler('slide2left')" />
    </div>
  </div>
</template>
<script>
import firebase from '../store/firebase.js'
import { Queue as QueueStore, queueConnect2firebase } from '../store/Queue.js'
import { playingStateConnect2firebase } from '../store/PlayingState.js'
import { userLogConnect2firebase } from '../store/UserLog.js'

import Header from '../components/room/Header.vue'
import PlayingState from '../components/PlayingState.vue'
import NoteDialog from '../components/NoteDialog.vue'
// import AdditionDisplay from '../components/AdditionDisplay.vue'
import RoomQueue from '../components/RoomQueue.vue'

export default {
  components: {
    Header,
    PlayingState,
    RoomQueue,
    NoteDialog,
    // AdditionDisplay,
  },
  data() {
    return {
      isMainSide: true,
      touchStartPosition: 0,
      isNoteDialogActive: false,
      editingNote: {
        queueKey: '',
        trackNameForLog: '',
        submitFunction: () => {},
      },
    }
  },
  computed: {
    mobileMode() {
      return window.innerWidth < 768 ? true : false
    },
  },
  beforeCreate() {
    if (!this.$store.hasModule('Queue')) {
      this.$store.registerModule('Queue', QueueStore)
    }
    // avoid user refresh page
    if (!this.$spotifyAPI.getAccessToken() && this.$store.getters.isTokenValid) {
      this.$spotifyAPI.setAccessToken(this.$store.getters.token)
    }
    const roomKey = localStorage.getItem('jukebox_room_key')
    firebase
      .database()
      .ref(`${roomKey}/basic`)
      .get()
      .then(snapshot => {
        this.$store.commit('setRoomBasicInfo', snapshot.val())
      })
  },
  mounted() {
    queueConnect2firebase(this.$store)
    playingStateConnect2firebase(this.$store)
    userLogConnect2firebase(this.$store)
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
        trackNameForLog: '',
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
      const currentDistance = this.touchStartPosition - event.changedTouches[0].clientX
      if (Math.abs(currentDistance) < 30) return
      if (currentDistance > 70) {
        this.sliderToggler('slide2left')
      } else if (currentDistance < 70) {
        this.sliderToggler('slide2right')
      } else {
        this.sliderToggler('resume')
      }
    },
    touchmoveHandler(event) {
      // left: -,   right: +
      const currentDistance = event.touches[0].clientX - this.touchStartPosition
      if (Math.abs(currentDistance) < 30) return
      if (this.isMainSide) {
        if (currentDistance > 50) {
          return
        } else {
          this.$refs.slideContainer.style.transform = `translate(${currentDistance}px, 0)`
        }
      } else {
        if (currentDistance < -50) {
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
  --primary-dark: #13192c;
  --secondary-dark: #0c0f1c;

  --primary-light: #f2f3f7;
  --secondary-light: #ffffff;

  --primary-highlight: #dd6e42;
  --secondary-highlight: #cf5626;

  --primary-neutral: #4b90c2;
  --secondary-neutral: #5aa4da;

  --ignore: #c0c0c0;

  --border-radius: 4px;
  a {
    color: var(--primary-light);
    text-decoration: none;
    text-decoration-color: var(--primary-neutral);
    &:visited {
      color: var(--ignore);
    }
    &:hover {
      color: var(--primary-neutral);
    }
  }
  button {
    background-color: inherit;
    border-radius: var(--border-radius);
    border: 1px solid var(--primary-highlight);
    color: var(--primary-light);
    &:focus {
      outline: none;
    }
  }
  svg {
    height: 16px;
    width: 16px;
    vertical-align: middle;
  }
  div {
    &::-webkit-scrollbar {
      width: 3px;
    }
    &::-webkit-scrollbar-thumb {
      background-color: transparent;
      border-radius: 6px;
    }
  }
  div:hover {
    &::-webkit-scrollbar-thumb {
      background-color: var(--secondary-neutral);
    }
  }
  color: var(--primary-light);
  background-color: var(--primary-dark);
  overflow: hidden;
  flex: 0;
  @media (min-width: 768px) {
    flex: 1;
    max-height: 100vh;
    width: 100vw;
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
    padding: 90px 10px 20px;
    @media (min-width: 768px) {
      padding: 0;
    }
  }
  .view.slide-items {
    display: flex;
    @media (min-width: 768px) {
      flex: 1;
      position: relative;
      padding: 100px 3% 30px;
      width: 0;
    }
  }
  .sidebar.slide-items {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    .playing-state {
      flex: 1;
    }
    @media (min-width: 768px) {
      width: 400px;
      padding: 40px 0 40px 20px;
    }
  }
}

.slide-navigation {
  display: flex;
  justify-content: center;
  position: fixed;
  bottom: 0;
  width: 100%;
  background-color: var(--primary-dark);
  padding-top: 5px;
  span {
    box-sizing: border-box;
    height: 4px;
    width: 15%;
    border-radius: var(--border-radius);
    border: 1px solid var(--ignore);
  }
  .view-navigation {
    margin-left: 5px;
  }
  .active {
    background-color: var(--secondary-neutral);
    border: none;
  }
  @media (min-width: 768px) {
    display: none;
  }
}
</style>
