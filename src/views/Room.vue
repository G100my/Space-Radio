<script>
import firebase from '../store/firebase.js'
import { Queue as QueueStore, queueConnect2firebase } from '../store/Queue.js'
import { playingStateConnect2firebase } from '../store/PlayingState.js'
import { userLogConnect2firebase } from '../store/UserLog.js'

import SlideContainer from '../components/SlideContainer.vue'
import SideDrawer from '../components/SideDrawer.vue'
import Header from '../components/room/Header.vue'
import PlayingState from '../components/PlayingState.vue'
import NoteDialog from '../components/NoteDialog.vue'
// import AdditionDisplay from '../components/AdditionDisplay.vue'
import RoomQueue from '../components/RoomQueue.vue'

export default {
  components: {
    SlideContainer,
    SideDrawer,
    Header,
    PlayingState,
    RoomQueue,
    NoteDialog,
    // AdditionDisplay,
  },
  data() {
    return {
      isNoteDialogActive: false,
      editingNote: {
        queueKey: '',
        trackNameForLog: '',
        submitFunction: () => {},
      },
      isSideDrawerShow: false,
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
  },
}
</script>
<template>
  <SlideContainer>
    <Header
      class="bg-tertiary-1 bg-opacity-60 show-all-flex px-8 pt-8 fixed inset-0 bottom-auto laptop:static laptop:p-0"
      @activeSideDrawer="isSideDrawerShow = true"
    />
    <template #left-side>
      <PlayingState />
    </template>
    <template #right-side>
      <RoomQueue />
      <!-- <AdditionDisplay
        v-if="!mobileMode"
        v-show="additionDisplayToggler"
        :source="additionDisplaySource"
        @activeNoteDialog="activeNoteDialogHandler"
        @disactiveSearchStyle="isSearchActive = false"
      /> -->
    </template>
    <SideDrawer
      v-show="isSideDrawerShow"
      id="SideDrawer"
      class="fixed w-full h-full z-50"
      @close="isSideDrawerShow = false"
    >
      <!-- other components -->
    </SideDrawer>
    <div class="slide-navigation laptop:hidden">
      <span :class="{ active: isMainSide }" @click="sliderToggler('slide2right')" />
      <span :class="{ active: !isMainSide }" @click="sliderToggler('slide2left')" />
    </div>
    <NoteDialog v-if="isNoteDialogActive" v-bind="editingNote" @finish="dialogFinishHandler" />
  </SlideContainer>
</template>
<style lang="postcss">
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
