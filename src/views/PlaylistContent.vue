<template>
  <!-- eslint-disable vue/no-parsing-error eslint-disable vue/html-self-closing -->
  <div class="tracks">
    <h1>PlaylistContent</h1>
    <TrackTable>
      <Track v-for="(track, index) in trackArray" :key="index" :info="track">
        <div class="button-group">
          <button type="button" @click="addToRoomQueue(track.id, index)">addToRoomQueue</button>
          <input :ref="`${index}`" type="text" />
          <button type="button" @click="jumpInRoomQueue(track.id, index)">jumpInRoomQueue</button>
        </div>
      </Track>
    </TrackTable>
  </div>
</template>
<script>
import TrackTable from '../components/TrackTable.vue'
import Track from '../components/Track.vue'

export default {
  components: {
    Track,
    TrackTable,
  },
  data() {
    return {
      trackArray: [],
    }
  },
  created() {
    this.getPlaylistContent()
  },
  methods: {
    getPlaylistContent() {
      const fields =
        '(limit,next,offset,total,items.track(album(external_urls,id,images.url,name,release_date),artists(external_urls,name,),duration_ms,external_urls,name,id))'
      this.$spotifyAPI.getPlaylistTracks('6SCQjqJptdOf0iN79JT9vA', { fields }).then(result => {
        this.trackArray = result.items.map(item => item.track)
      })
    },
    addToRoomQueue(trackId) {
      this.$store.commit('push', trackId)
    },
    jumpInRoomQueue(trackId, index) {
      const message = this.$refs[`${index}`].value
      this.$store.commit('jump_in', { trackId, message })
      this.$refs[`${index}`].value = ''
    },
  },
}
</script>
