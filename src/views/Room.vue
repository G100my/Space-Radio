<template>
  <div class="room" @touchstart="touchstartHandler" @touchmove="touchmoveHandler" @touchend="touchendHandler">
    <header :class="{ 'active-search': isSearchActive }">
      <Marquee />
      <nav>
        <AdditionDisplay
          v-if="mobileMode"
          v-show="additionDisplayToggler"
          :source="additionDisplaySource"
          @activeNoteDialog="activeNoteDialogHandler"
          @disactiveSearchStyle="isSearchActive = false"
        />
        <SearchBar
          @triggerSearchStyle="isSearchActive = $event"
          @triggerAdditionDisplay="additionDisplayToggler = $event"
          @updateAdditionDisplaySource="additionDisplaySource = $event"
        />
        <h1>
          <img src="../assets/vinyl-record.png" alt="" />
          <p>Jukebox</p>
        </h1>
        <ul>
          <li>
            <UserRecentPlayedButton
              @triggerAdditionDisplay="additionDisplayToggler = !additionDisplayToggler"
              @updateAdditionDisplaySource="additionDisplaySource = $event"
            />
          </li>
          <li class="user-name">
            <p>
              <!-- prettier-ignore -->
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-person-fill" viewBox="0 0 16 16">
                <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
              </svg>
              <span>{{ $store.getters.userName }}</span>
            </p>
          </li>
        </ul>
      </nav>
    </header>
    <div ref="slideContainer" class="slide-container">
      <div class="sidebar slide-items">
        <PlayingState />
      </div>
      <div class="view slide-items">
        <RoomQueue @activeNoteDialog="activeNoteDialogHandler" />
        <AdditionDisplay
          v-if="!mobileMode"
          v-show="additionDisplayToggler"
          :source="additionDisplaySource"
          @activeNoteDialog="activeNoteDialogHandler"
          @disactiveSearchStyle="isSearchActive = false"
        />
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
import { Queue as QueueStore, queueConnect2firebase } from '../store/Queue.js'
import { playingStateConnect2firebase } from '../store/PlayingState.js'
import { userLogConnect2firebase } from '../store/UserLog.js'

import PlayingState from '../components/PlayingState.vue'
import SearchBar from '../components/SearchBar.vue'
import NoteDialog from '../components/NoteDialog.vue'
import Marquee from '../components/Marquee.vue'
import AdditionDisplay from '../components/AdditionDisplay.vue'
import UserRecentPlayedButton from '../components/featureButtons/UserRecentPlayedButton.vue'
import RoomQueue from '../components/RoomQueue.vue'

export default {
  components: {
    PlayingState,
    RoomQueue,
    SearchBar,
    NoteDialog,
    Marquee,
    AdditionDisplay,
    UserRecentPlayedButton,
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
      isSearchActive: false,
      additionDisplayToggler: false,
      additionDisplaySource: [],
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

$icon-length: 35px;
header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
  display: flex;
  flex-direction: column-reverse;
  background-color: var(--primary-dark);
  @media (min-width: 768px) {
    left: auto;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    width: calc(100% - 400px);
    background-color: initial;
  }
}
nav {
  padding: 15px;
  display: flex;
  width: 100%;
  box-sizing: border-box;
  @media (min-width: 768px) {
    justify-content: flex-end;
    transition: flex 0.3s ease-in-out;
    flex: 0 0 0;
  }

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
      margin: 0;
    }
  }

  > ul {
    display: flex;
    font-size: 0;
    justify-content: flex-end;
    li {
      border: 2px solid var(--primary-highlight);
      border-radius: 4px;
    }
    .list-toggler {
      border: none;
      height: $icon-length;
      width: $icon-length;
      svg {
        height: 100%;
        width: 100%;
        vertical-align: bottom;
      }
    }
    .user-name {
      margin-left: 10px;
      font-size: 16px;
      height: $icon-length;
      display: flex;
      align-items: center;
      p {
        margin: 0 5px;
        white-space: nowrap;
      }
      svg {
        vertical-align: bottom;
        height: 20px;
        width: 20px;
      }
      span {
        display: inline-block;
        max-width: 55px;
        text-overflow: ellipsis;
        overflow: hidden;
        vertical-align: bottom;
        @media (min-width: 768px) {
          max-width: none;
        }
      }
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
}
</style>
