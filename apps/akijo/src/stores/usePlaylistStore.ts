import { defineStore } from 'pinia'
import { spotifyAPI } from '@/plugins/spotifyAPI'

export type ListType = 'long_term' | 'medium_term' | 'short_term' | 'recently' | 'saved'

interface State {
  tracks: {
    items: SpotifyApi.TrackObjectSimplified[]
    paging: Omit<SpotifyApi.PagingObject<any>, 'items'> | null
  }
  lists: SpotifyApi.ListOfUsersPlaylistsResponse | null
  long_term: SpotifyApi.UsersTopTracksResponse | null // calculated from several years of data and including all new data as it becomes available
  medium_term: SpotifyApi.UsersTopTracksResponse | null // approximately last 6 months
  short_term: SpotifyApi.UsersTopTracksResponse | null // approximately last 4 weeks
  recently: SpotifyApi.UsersRecentlyPlayedTracksResponse | null
  saved: SpotifyApi.UsersSavedTracksResponse | null
}

export default defineStore('playlist', {
  state: (): State => ({
    tracks: {
      items: [],
      paging: null,
    },
    lists: null,
    long_term: null,
    medium_term: null,
    short_term: null,
    recently: null,
    saved: null,
  }),
  actions: {
    async getLists(type?: ListType) {
      switch (type) {
        case 'recently':
          this.recently = await spotifyAPI.getMyRecentlyPlayedTracks({ limit: 50 })
          break
        case 'saved':
          this.saved = await spotifyAPI.getMySavedTracks({ limit: 50 })
          break
        case 'long_term':
        case 'medium_term':
        case 'short_term': {
          const result = await spotifyAPI.getMyTopTracks({ limit: 50, time_range: type })
          this[type] = result
          break
        }
        default:
          this.lists = await spotifyAPI.getUserPlaylists(undefined, { limit: 50 })
          break
      }
    },
  },
})
