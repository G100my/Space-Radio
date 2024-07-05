import { defineStore } from 'pinia'
import { spotifyWrappedAPI } from '@/api/spotifyWrappedAPI'
import useSearchStore from './useSearchStore'
import type { TrackBaseInfo } from '@/constant'

const limit = 50

export type ListType =
  | 'short_term'
  | 'medium_term'
  | 'long_term'
  | 'recently'
  | 'liked'
  | 'playlist'
  | 'album'
  | 'artist'

interface State {
  type: ListType | undefined
  items: TrackBaseInfo[]
  paging: Omit<SpotifyApi.PagingObject<any>, 'items'> | null
  lists: SpotifyApi.ListOfUsersPlaylistsResponse | null
  long_term: SpotifyApi.UsersTopTracksResponse | null // calculated from several years of data and including all new data as it becomes available
  medium_term: SpotifyApi.UsersTopTracksResponse | null // approximately last 6 months
  short_term: SpotifyApi.UsersTopTracksResponse | null // approximately last 4 weeks
  recently: SpotifyApi.UsersRecentlyPlayedTracksResponse | null
  liked: SpotifyApi.UsersSavedTracksResponse | null
}

export default defineStore('tracks', {
  state: (): State => ({
    type: undefined,

    items: [],
    paging: null,

    lists: null,

    recently: null,
    liked: null,

    long_term: null,
    medium_term: null,
    short_term: null,
  }),
  getters: {
    computedItems(state): TrackBaseInfo[] {
      switch (state.type) {
        case 'album':
        case 'artist':
        case 'playlist':
        case 'liked':
        case 'recently':
          return state.items

        case 'short_term':
        case 'medium_term':
        case 'long_term':
          return state[state.type]!.items

        default:
          return []
      }
    },
  },
  actions: {
    async getLists() {
      this.lists = await spotifyWrappedAPI.getUserPlaylists(undefined, { limit: 50 })
    },
    async fetchTracks({ type, uri, next }: { type: ListType; uri?: string; next?: true }) {
      let result: Pick<State, 'items' | 'paging'>
      const options = { limit, offset: next ? (this.paging?.offset ?? 0) + limit : 0 }
      this.type = type

      switch (type) {
        case 'album': {
          const album = useSearchStore().currentAlbum!
          const { items, ...rest } = await spotifyWrappedAPI.getAlbumTracks(uri!, options)
          result = { items: items.map(i => ({ ...i, album })), paging: rest }
          break
        }

        case 'artist': {
          const res = await spotifyWrappedAPI.getArtistTopTracks(uri!, 'TW', options)
          result = { items: res.tracks, paging: null }
          break
        }

        case 'playlist': {
          const { items, ...rest } = await spotifyWrappedAPI.getPlaylistTracks(uri!, options)
          result = { items: items.map(i => i.track as SpotifyApi.TrackObjectFull), paging: rest }
          break
        }

        case 'recently': {
          const { items } = await spotifyWrappedAPI.getMyRecentlyPlayedTracks({ limit: 50 })
          result = { items: items.map(i => i.track as SpotifyApi.TrackObjectFull), paging: null }
          break
        }

        case 'long_term':
        case 'medium_term':
        case 'short_term': {
          if (this[type]?.items.length) return
          const { items, ...rest } = await spotifyWrappedAPI.getMyTopTracks({ type, ...options })
          result = { items, paging: rest }
          break
        }

        case 'liked': {
          const { items, ...rest } = await spotifyWrappedAPI.getMySavedTracks(options)
          result = { items: items.map(i => i.track), paging: rest }
        }
      }
      if (next) {
        this.$patch({ items: [...this.items, ...result!.items], paging: result!.paging })
      } else {
        this.$patch({ ...result! })
      }
    },
    addTrackToPlaylist({ playlistId, trackUri }: { playlistId: string; trackUri: string }) {
      return spotifyWrappedAPI.addTracksToPlaylist(playlistId, [trackUri])
    },
  },
})
