<script>
import IconSpotifyDark from '@/assets/icons/icon/spotify-dark.svg'
// import spotifyAPI from '@/utility/spotifyAPI'
export default {
  components: {
    IconSpotifyDark,
  },
  // setup() {
  //   const playerPlayingTrackId = computed(() => store.getters.playerPlayingTrackId)
  //   const selectedPlaylistKey = ref(null)

  //   function collectHandler() {
  //     spotifyAPI
  //       .addTracksToPlaylist(selectedPlaylistKey, [`spotify:track:${playerPlayingTrackId.value}`])
  //       .then(result => {
  //         console.log(result)
  //         localStorage.setItem('jukebox_previous_playlise_key', selectedPlaylistKey)
  //       })
  //   }
  // }
}
</script>
<template>
  <div class="flex flex-col">
    <label class="text-natural-gray3 font-bold">Collect to Spotify</label>
    <button :disabled="!playerPlayingTrackId" type="button" class="btn-primary mt-2">
      <IconSpotifyDark />
      <span>Collect to Spotify</span>
    </button>
  </div>
</template>
