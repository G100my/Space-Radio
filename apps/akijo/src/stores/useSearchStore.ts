import { defineStore } from 'pinia'
import { spotifyCustomerAPI } from '@/api/spotifyCustomerAPI'

const localStorageKey = 'akijo-search'

interface State {
  query: string
  recentSearch: string[]
  tracksPaging: Omit<SpotifyApi.PagingObject<any>, 'items'> | null
  tracks: SpotifyApi.TrackObjectFull[] | null
  albumsPaging: Omit<SpotifyApi.PagingObject<any>, 'items'> | null
  albums: SpotifyApi.AlbumObjectSimplified[] | null
  artistsPaging: Omit<SpotifyApi.PagingObject<any>, 'items'> | null
  artists: SpotifyApi.ArtistObjectFull[] | null
  type: Exclude<Parameters<typeof spotifyCustomerAPI.search>[1][number], 'playlist'>
}
export default defineStore('search', {
  state: (): State => ({
    query: '',
    recentSearch: [],
    type: 'track',
    tracksPaging: null,
    tracks: null,
    albumsPaging: null,
    albums: null,
    artistsPaging: null,
    artists: null,
  }),
  getters: {
    currentResult: state => {
      switch (state.type) {
        case 'album':
          return { paging: state.albumsPaging, items: state.albums }
        case 'artist':
          return { paging: state.artistsPaging, items: state.artists }
        case 'track':
          return { paging: state.tracksPaging, items: state.tracks }
      }
    },
  },
  actions: {
    search() {
      this.recentSearch.push(this.query)
      if (this.recentSearch.length > 30) this.recentSearch.shift()
      localStorage.setItem(localStorageKey, JSON.stringify(this.recentSearch))
      spotifyCustomerAPI.search(this.query, [this.type], { market: 'TW' }).then(res => {
        switch (this.type) {
          case 'album': {
            const { items, ...rest } = (res as SpotifyApi.AlbumSearchResponse).albums
            this.albums = items
            this.albumsPaging = rest
            break
          }
          case 'artist': {
            const { items, ...rest } = (res as SpotifyApi.ArtistSearchResponse).artists
            this.artists = items
            this.artistsPaging = rest
            break
          }
          case 'track': {
            const { items, ...rest } = (res as SpotifyApi.TrackSearchResponse).tracks
            this.tracks = items
            this.tracksPaging = rest
            break
          }
        }
      })
    },
    async fetchNext() {
      if (!this.currentResult.paging?.next) return Promise.resolve()
      const limit = 25
      const result = await spotifyCustomerAPI.search(this.query, [this.type], {
        offset: this.currentResult.paging.offset + limit,
        limit,
      })
      switch (this.type) {
        case 'album': {
          const { items, ...rest } = (result as SpotifyApi.AlbumSearchResponse).albums
          this.albums = this.albums?.concat(items) ?? items
          this.albumsPaging = rest
          break
        }
        case 'artist': {
          const { items, ...rest } = (result as SpotifyApi.ArtistSearchResponse).artists
          this.artists = this.artists?.concat(items) ?? items
          this.artistsPaging = rest
          break
        }
        case 'track': {
          const { items, ...rest } = (result as SpotifyApi.TrackSearchResponse).tracks
          this.tracks = this.tracks?.concat(items) ?? items
          this.tracksPaging = rest
          break
        }
      }
      return this.currentResult
    },
  },
})
