<script lang="ts">
import { computed, onMounted, ref } from 'vue'
import firebase from '@/plugins/firebase'
import { spotifyAPI } from '@/plugins/spotifyAPI'
import { queueConnect2firebase } from '@/store/QueueStore'
import { playingStateConnect2firebase, useVolumeStore } from '@/store/PlayingStateStore'
// import { userLogConnect2firebase } from '@/store/UserLog'

import SlideContainer from '@/components/SlideContainer.vue'
import SideDrawer from '@/components/sideDrawer/SideDrawer.vue'
import RoomHeader, { type ComponentName } from '@/components/header/RoomHeader.vue'
import PlayingState from '@/components/player/PlayingState.vue'
import CustomerVolumeBar from '@/components/player/CustomerVolumeBar.vue'
import VolumnBar from '@/components/VolumnBar.vue'
import Collection from '@/components/player/Collection.vue'
import Vote from '@/components/player/Vote.vue'
import UserLog from '@/components/player/UserLog.vue'
import AddFromStreamingService from '@/components/sideDrawer/AddFromStreamingService.vue'
import Recommendation from '@/components/sideDrawer/Recommendation.vue'
import PlaylistContent from '@/components/sideDrawer/PlaylistContent.vue'
import Search from '@/components/sideDrawer/Search.vue'
import Personal from '@/components/sideDrawer/Personal.vue'
import NoteDialog from '@/components/lineup/NoteDialog.vue'
import RoomQueue from '@/components/lineup/RoomQueue.vue'
import { usePersonalStore } from '@/store/PersonalStore'
import { useRoomBasicStore } from '@/store'
import { userLogConnect2firebase } from '@/store/UserLogStore'

export default {
  components: {
    SlideContainer,
    SideDrawer,
    RoomHeader,
    PlayingState,
    VolumnBar,
    Collection,
    Vote,
    RoomQueue,
    NoteDialog,
    UserLog,
    AddFromStreamingService,
    Recommendation,
    PlaylistContent,
    Search,
    Personal,
    CustomerVolumeBar,
  },
  setup() {
    const personalStore = usePersonalStore()
    const roomBasicStore = useRoomBasicStore()
    const volumeStore = useVolumeStore()

    // avoid user refresh page
    if (!spotifyAPI.getAccessToken() && personalStore.isTokenValid) {
      spotifyAPI.setAccessToken(usePersonalStore().token)
    }
    const roomKey = localStorage.getItem('spaceradio_room_key')
    firebase
      .database()
      .ref(`${roomKey}/basic`)
      .get()
      .then(snapshot => {
        roomBasicStore.update(snapshot.val())
      })

    onMounted(() => {
      queueConnect2firebase()
      playingStateConnect2firebase()
      userLogConnect2firebase()
    })

    const isSideDrawerShow = ref(false)
    const activeComponent = ref<ComponentName>('Personal')

    function activeSideDrawerHandler(componentName: ComponentName) {
      isSideDrawerShow.value = true
      activeComponent.value = componentName
    }

    return {
      isSideDrawerShow,
      activeComponent,
      activeSideDrawerHandler,
      personalStore: usePersonalStore(),
      volumeStore: useVolumeStore(),

      mobileMode: computed(() => (window.innerWidth < 768 ? true : false)),
      currentVolume: computed(() => volumeStore.volume),
    }
  },
}
</script>
<template>
  <div id="room" class="relative flex h-full flex-col overflow-hidden bg-tertiary-1 bg-opacity-80 laptop:bg-tertiary-2">
    <RoomHeader class="_show_all_flex _container" @activeSideDrawer="activeSideDrawerHandler" />
    <SlideContainer class="_container flex-1">
      <template #left-side>
        <div class="flex min-h-full flex-col laptop:pt-7">
          <PlayingState />
          <VolumnBar
            v-if="!personalStore.customerPlayerMode"
            :modelValue="currentVolume"
            disabledBar
            class="mt-7 laptop:mt-3"
            @minus="volumeStore.turnDown"
            @plus="volumeStore.turnUp"
          />
          <CustomerVolumeBar v-else class="mt-7 laptop:mt-3" />
          <Collection class="mt-4" />
          <Vote class="my-4" />
          <UserLog class="hidden max-h-72 flex-1 laptop:flex" />
        </div>
      </template>
      <template #right-side>
        <RoomQueue class="flex-1 laptop:pt-7" />
      </template>
    </SlideContainer>

    <NoteDialog id="note" />

    <!-- accept 'Search', 'AddFromStreamingService', 'Personal', 'PlaylistContent' those emited from Header -->
    <SideDrawer v-model="isSideDrawerShow" :componentName="activeComponent">
      <component :is="activeComponent" @activeSideDrawer="activeSideDrawerHandler" />
    </SideDrawer>
  </div>
</template>
