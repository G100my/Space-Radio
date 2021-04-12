<template>
  <div class="doorscope">
    <div class="doorscope-container">
      <div class="header">
        <h1>Jukebox</h1>
      </div>
      <div class="content">
        <label for="search-room-input">Room Name or Room Key</label>
        <input id="search-room-input" type="text" />
        <button type="button" @click="searchRoomKey">Next</button>
      </div>
      <div class="footer" :to="{ name: 'CreateRoom' }">
        <router-link to="">Having no room? Create one!</router-link>
      </div>
    </div>
  </div>
  <BaseModal>
    <div />
  </BaseModal>
</template>
<script>
import { mapGetters } from 'vuex'
import firebase from '../store/firebase.js'
import { PKCE } from '../utility/PKCE.js'
import BaseModal from '../components/base/BaseModal.vue'

export default {
  components: {
    BaseModal,
  },
  data() {
    return {
      targetRoomName: '',
      roomListObject: {},
      searchKeyWordInput: '',
    }
  },
  computed: {
    ...mapGetters(['playerPlayingAlbum', 'playerPlayingArtists', 'playerPlayingTrackName']),
  },
  beforeCreate() {
    const pathRoomKey = this.$route.params.roomKey
    firebase
      .database()
      .ref('room_list')
      .get()
      .then(snapshot => {
        this.roomListObject = snapshot.val()

        if (pathRoomKey) {
          const hasRoom = Object.prototype.hasOwnProperty.call(this.roomListObject, pathRoomKey)

          if (hasRoom) {
            this.fetchRoomBasicInfo(pathRoomKey)
            localStorage.setItem('jukebox_room_key', pathRoomKey)
          } else {
            this.$router.push({ name: 'Lobby' })
          }
        }
      })
  },
  methods: {
    PKCE,
    searchRoomKey() {
      let targetRoomKey
      // 可以搜尋 room key 或者搜尋 room name
      if (Object.prototype.hasOwnProperty.call(this.roomListObject, this.searchKeyWordInput)) {
        targetRoomKey = this.searchKeyWordInput
      } else {
        for (let key in this.roomListObject) {
          if (this.roomListObject[key] === this.searchKeyWordInput) {
            targetRoomKey = key
            break
          }
        }
      }
      if (targetRoomKey) {
        localStorage.setItem('jukebox_room_key', targetRoomKey)
        this.fetchRoomBasicInfo(targetRoomKey)
      } else {
        console.log('no result')
        localStorage.setItem('jukebox_room_key', targetRoomKey)
        this.$store.commit('refreshPlayerTrack', null)
        this.targetRoomName = ''
      }
    },
    fetchRoomBasicInfo(roomKey) {
      const room_ref = firebase.database().ref(roomKey)
      room_ref
        .child('playing_state')
        .get()
        .then(snapshot => {
          const playingTrack = snapshot.val()['playing_track']
          this.$store.commit('refreshPlayerTrack', playingTrack)
        })
      room_ref
        .child('basic/room_name')
        .get()
        .then(snapshot => {
          this.targetRoomName = snapshot.val()
        })
    },
  },
}
</script>
<style lang="scss">
.doorscope {
  flex: 1;
  box-sizing: border-box;
  background: gray;
  display: flex;
  align-items: center;
  justify-content: center;

  &-container {
    width: 60%;
  }
  .header {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    > h1 {
      font-size: 3rem;
    }
  }
  .content {
    display: flex;
    flex-direction: column;
  }
}
</style>
