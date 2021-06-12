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
<template>
  <div
    class="
      bg-tertiary-2
      h-screen
      overflow-hidden
      flex
      laptop:pl-[60px]
      laptop:pr-[74px]
      laptop:py-10
      laptop:items-stretch
      laptop:flex laptop:flex-col
    "
    @touchstart="touchstartHandler"
    @touchmove="touchmoveHandler"
    @touchend="touchendHandler"
  >
    <Header
      class="bg-tertiary-1 bg-opacity-60 show-all-flex px-8 pt-8 fixed inset-0 bottom-auto laptop:static laptop:p-0"
    />
    <div
      ref="slideContainer"
      class="
        show-all-flex
        w-full
        mt-24
        mb-10
        flex
        items-stretch
        transition-transform
        laptop:h-auto
        laptop:flex-1
        laptop:my-0
      "
    >
      <div
        class="
          bg-tertiary-1 bg-opacity-60
          flex-shrink-0
          w-full
          px-8
          pb-8
          overflow-y-auto
          laptop:w-96
          laptop:px-0
          laptop:pb-0
        "
      >
        <PlayingState />
      </div>
      <div class="flex-shrink-0 w-full px-8 pb-8 flex laptop:flex-1 laptop:relative laptop:px-0 laptop:pb-0">
        <RoomQueue />
        <!-- <AdditionDisplay
          v-if="!mobileMode"
          v-show="additionDisplayToggler"
          :source="additionDisplaySource"
          @activeNoteDialog="activeNoteDialogHandler"
          @disactiveSearchStyle="isSearchActive = false"
        /> -->
      </div>
    </div>
    <div class="slide-navigation laptop:hidden">
      <span :class="{ active: isMainSide }" @click="sliderToggler('slide2right')" />
      <span :class="{ active: !isMainSide }" @click="sliderToggler('slide2left')" />
    </div>
    <NoteDialog v-if="isNoteDialogActive" v-bind="editingNote" @finish="dialogFinishHandler" />
  </div>
</template>
<style lang="postcss">
.show-all-flex {
  & > *:first-child {
    @apply laptop:flex-none laptop:w-96;
  }
  & > *:last-child {
    @apply laptop:flex-1;
  }
}

.slide-navigation {
  @apply flex justify-center fixed bottom-0 w-full;
  & > span {
    @apply h-10 w-3/12 rounded-sm;
  }
  & > .active {
    @apply bg-yellow-500;
  }
}
</style>
