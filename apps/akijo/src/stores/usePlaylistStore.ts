import { defineStore } from 'pinia'
import { spotifyAPI } from '@/plugins/spotifyAPI'

interface State {
  lists: SpotifyApi.ListOfUsersPlaylistsResponse | null
}

export default defineStore('playlist', {
  state: (): State => ({
    lists: null,
    // long_term: [], // calculated from several years of data and including all new data as it becomes available
    // medium_term: [], // approximately last 6 months
    // short_term: [], // approximately last 4 weeks
    // recently: [],
  }),
  actions: {
    async getLists() {
      this.lists = await spotifyAPI.getUserPlaylists(undefined, { limit: 50 })
    },
  },
})
