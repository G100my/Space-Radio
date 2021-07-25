<script>
import { computed, onMounted, ref } from 'vue'
import firebase from '../store/firebase.js'
import { spotifyAPI } from '@/utility/spotifyAPI'
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
import AddFromStreamingService from '@/components/sideDrawer/AddFromStreamingService.vue'
import PlaylistContent from '@/components/sideDrawer/PlaylistContent.vue'
// import NoteDialog from '../components/lineup/NoteDialog.vue'
// import AdditionDisplay from '../components/AdditionDisplay.vue'
import RoomQueue from '../components/lineup/RoomQueue.vue'
import { useStore } from 'vuex'

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
    // NoteDialog,
    UserLog,
    // AdditionDisplay,
    AddFromStreamingService,
    PlaylistContent,
  },
  setup() {
    const store = useStore()
    if (!store.hasModule('Queue')) {
      store.registerModule('Queue', QueueStore)
    }
    // avoid user refresh page
    if (!spotifyAPI.getAccessToken() && store.getters.isTokenValid) {
      spotifyAPI.setAccessToken(store.getters.token)
    }
    const roomKey = localStorage.getItem('jukebox_room_key')
    firebase
      .database()
      .ref(`${roomKey}/basic`)
      .get()
      .then(snapshot => {
        store.commit('setRoomBasicInfo', snapshot.val())
      })

    onMounted(() => {
      queueConnect2firebase(store)
      playingStateConnect2firebase(store)
      userLogConnect2firebase(store)
    })

    const isSideDrawerShow = ref(false)
    const activeComponent = ref(null)

    // const editingNote = reactive({
    //   queueKey: '',
    //   trackNameForLog: '',
    //   submitFunction: () => {},
    // })
    // const isNoteDialogActive = ref(false)
    // function activeNoteDialogHandler(note) {
    //   editingNote.value = { ...note }
    //   isNoteDialogActive.value = true
    // }
    // function dialogFinishHandler() {
    //   isNoteDialogActive.value = false
    //   editingNote.value = {
    //     queueKey: '',
    //     trackNameForLog: '',
    //     submitFunction: () => {},
    //   }
    // }

    function activeSideDrawerHandler(componentName) {
      isSideDrawerShow.value = true
      activeComponent.value = componentName
    }

    return {
      isSideDrawerShow,
      activeComponent,
      activeSideDrawerHandler,

      mobileMode: computed(() => (window.innerWidth < 768 ? true : false)),
      currentVolume: computed(() => store.getters.currentVolume),
    }
  },
}
</script>
<template>
  <div id="room" class="relative bg-tertiary-2 h-full flex flex-col overflow-hidden">
    <Header class="_show_all_flex" @activeSideDrawer="activeSideDrawerHandler" />
    <SlideContainer class="flex-1">
      <template #left-side>
        <div class="min-h-full flex flex-col">
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

    <!-- fixme -->
    <!-- <NoteDialog v-if="isNoteDialogActive" v-bind="editingNote" @finish="dialogFinishHandler" /> -->

    <!-- accept 'Search', 'AddFromStreamingService', 'Personal', 'PlaylistContent' those emited from Header -->
    <SideDrawer v-model="isSideDrawerShow">
      <component :is="activeComponent" @activeSideDrawer="activeSideDrawerHandler" />
    </SideDrawer>
  </div>
</template>
