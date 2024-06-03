import { defineStore } from 'pinia'
import { spotifyAPI } from '@/plugins/spotifyAPI'

const localStorageKey = 'akijo-search'

interface State {
  recentSearch: string[]
  result: SpotifyApi.SearchResponse | null
  type: Exclude<Parameters<typeof spotifyAPI.search>[1][number], 'playlist'>
}
export default defineStore('search', {
  state: (): State => ({
    recentSearch: [],
    type: 'track',
    result: null,
  }),
  getters: {
    listBySearchType: state => {
      switch (state.type) {
        case 'album':
          return state.result?.albums?.items || []
        case 'artist':
          return state.result?.artists?.items || []
        case 'track':
          return state.result?.tracks?.items || []
        default:
          return []
      }
    },
  },
  actions: {
    search(query: string) {
      this.recentSearch.push(query)
      if (this.recentSearch.length > 30) this.recentSearch.shift()
      localStorage.setItem(localStorageKey, JSON.stringify(this.recentSearch))
      spotifyAPI.search(query, ['album', 'artist', 'track'], { market: 'TW' }).then(res => {
        this.result = res
      })
    },
    getAlbum(id: string) {
      return spotifyAPI.getAlbum(id)
    },
    getArtist(id: string) {
      return spotifyAPI.getArtist(id)
    },
  },
})
