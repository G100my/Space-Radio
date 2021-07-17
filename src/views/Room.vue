<script>
import firebase from '../store/firebase.js'
import { Queue as QueueStore, queueConnect2firebase } from '../store/Queue.js'
import { playingStateConnect2firebase } from '../store/PlayingState.js'
import { userLogConnect2firebase } from '../store/UserLog.js'

import SlideContainer from '../components/SlideContainer.vue'
import SideDrawer from '../components/SideDrawer.vue'
import Header from '../components/header/Header.vue'
import PlayingState from '../components/player/PlayingState.vue'
import VolumnBar from '@/components/VolumnBar.vue'
import Collection from '@/components/player/Collection.vue'
import Vote from '@/components/player/Vote.vue'
import UserLog from '@/components/player/UserLog.vue'
import NoteDialog from '../components/lineup/NoteDialog.vue'
// import AdditionDisplay from '../components/AdditionDisplay.vue'
import RoomQueue from '../components/lineup/RoomQueue.vue'

export default {
  components: {
    SlideContainer,
    SideDrawer,
    Header,
    PlayingState,
    VolumnBar,
    Collection,
    Vote,
    RoomQueue,
    NoteDialog,
    UserLog,
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
    currentVolume() {
      return this.$store.getters.currentVolume
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
  <div id="room" class="relative bg-tertiary-2 h-full flex flex-col overflow-hidden">
    <Header class="_show_all_flex" @activeSideDrawer="isSideDrawerShow = true" />
    <SlideContainer class="flex-1">
      <template #left-side>
        <div class="h-full flex flex-col">
          <PlayingState />
          <VolumnBar
            :value="currentVolume"
            class="mt-7 laptop:mt-3"
            @minus="$store.dispatch('turnDown')"
            @plus="store.dispatch('turnUp')"
          />
          <Collection class="mt-4" />
          <Vote class="my-4" />
          <UserLog class="flex-1 hidden laptop:block" />
        </div>
      </template>
      <template #right-side>
        <RoomQueue class="flex-1" />
        <!-- <AdditionDisplay
        v-if="!mobileMode"
        v-show="additionDisplayToggler"
        :source="additionDisplaySource"
        @activeNoteDialog="activeNoteDialogHandler"
        @disactiveSearchStyle="isSearchActive = false"
      /> -->
      </template>
    </SlideContainer>

    <!-- absolute -->
    <NoteDialog v-if="isNoteDialogActive" v-bind="editingNote" @finish="dialogFinishHandler" />
    <SideDrawer v-model="isSideDrawerShow">
      <!-- other components placeholder -->
    </SideDrawer>
  </div>
</template>
