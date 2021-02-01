<template>
  <!-- eslint-disable vue/no-parsing-error eslint-disable vue/html-self-closing -->
  <div class="tracks">
    <h1>PlaylistContent</h1>
    <TrackTable>
      <Track v-for="(track, index) in trackArray" :key="index" :info="track">
        <div class="button-group" :data-id="track.id" :data-index="index">
          <p>{{ track.id }}</p>
          <p>{{ index }}</p>
          <button type="button" @click.stop="addToRoomQueue">addToRoomQueue</button>
          <input :ref="`${index}`" type="text" />
          <button type="button" @click.stop="jumpInRoomQueue">jumpInRoomQueue</button>
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
    addToRoomQueue(event) {
      const index = event.target.parentElement.dataset.index
      const id = event.target.parentElement.dataset.id
      const message = this.$refs[`${index}`].value
      this.$store.dispatch('add', { id, message })
    },
    jumpInRoomQueue(event) {
      const id = event.target.parentElement.dataset.id
      const index = event.target.parentElement.dataset.index
      const message = this.$refs[`${index}`].value
      this.$store.dispatch('jumpIn', { id, message })
      this.$refs[`${index}`].value = ''
    },
  },
}
</script>
