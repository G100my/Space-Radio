<script>
import { computed, onMounted, ref } from 'vue'
import firebase from '../store/firebase.js'
import { spotifyAPI } from '@/utility/spotifyAPI'
import { Queue as QueueStore, queueConnect2firebase } from '../store/Queue.js'
import { playingStateConnect2firebase } from '../store/PlayingState.js'
import { userLogConnect2firebase } from '../store/UserLog.js'

import SlideContainer from '../components/SlideContainer.vue'
import SideDrawer from '../components/sideDrawer/SideDrawer.vue'
import Header from '../components/header/Header.vue'
import PlayingState from '../components/player/PlayingState.vue'
import VolumnBar from '@/components/VolumnBar.vue'
import Collection from '@/components/player/Collection.vue'
import Vote from '@/components/player/Vote.vue'
import UserLog from '@/components/player/UserLog.vue'
import AddFromStreamingService from '@/components/sideDrawer/AddFromStreamingService.vue'
import PlaylistContent from '@/components/sideDrawer/PlaylistContent.vue'
import Search from '@/components/sideDrawer/Search.vue'
import NoteDialog from '../components/lineup/NoteDialog.vue'
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
    NoteDialog,
    UserLog,
    AddFromStreamingService,
    PlaylistContent,
    Search,
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
  <div id="room" class="relative bg-tertiary-1 bg-opacity-80 h-full flex flex-col overflow-hidden laptop:bg-tertiary-2">
    <Header class="_show_all_flex _container" @activeSideDrawer="activeSideDrawerHandler" />
    <SlideContainer class="_container flex-1">
      <template #left-side>
        <div class="min-h-full flex flex-col laptop:pt-7">
          <PlayingState />
          <VolumnBar
            :modelValue="currentVolume"
            disabled
            class="mt-7 laptop:mt-3"
            @minus="$store.dispatch('turnDown', $event)"
            @plus="$store.dispatch('turnUp', $event)"
          />
          <Collection class="mt-4" />
          <Vote class="my-4" />
          <UserLog class="flex-1 max-h-72 hidden laptop:flex" />
        </div>
      </template>
      <template #right-side>
        <RoomQueue class="flex-1 laptop:pt-7" />
      </template>
    </SlideContainer>

    <NoteDialog id="note" />

    <!-- accept 'Search', 'AddFromStreamingService', 'Personal', 'PlaylistContent' those emited from Header -->
    <SideDrawer v-model="isSideDrawerShow">
      <component :is="activeComponent" @activeSideDrawer="activeSideDrawerHandler" />
    </SideDrawer>
  </div>
</template>
