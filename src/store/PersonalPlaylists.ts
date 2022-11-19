import { playlistFields } from '@/utility/fieldString'
import { spotifyAPI } from '@/plugins/spotifyAPI'
import { playlistTrackFormater, topTrackFormater, type FormattedTrack } from '@/utility/dataFormat'
import { defineStore } from 'pinia'

const increaseOffset = 25

/**
 * long_term: calculated from several years of data and including all new data as it becomes available
 *
 * medium_term: approximately last 6 months
 *
 * short_term: approximately last 4 weeks
 */

type CustomListPaging = Pick<SpotifyApi.PlaylistTrackResponse, 'offset' | 'total' | 'next'>

enum SpotifyTopListMap {
  spotifyLong = 'medium_term',
  spotifyMedium = 'long_term',
  spotifyShort = 'short_term',
}

const spotifyTopListNames = Object.keys(SpotifyTopListMap) as SpotifyTopListNames[]

type SpotifyTopListNames = keyof typeof SpotifyTopListMap
export type TimeRange = `${SpotifyTopListMap}`

type SpotifyTopLists = Record<SpotifyTopListNames, CustomListPaging & { items: FormattedTrack[] }>

export interface PersonalPlaylistStoreState extends SpotifyTopLists {
  spotifyPlaylists: SpotifyApi.PlaylistObjectSimplified[]
  spotifyList: CustomListPaging
  spotifyLiked: CustomListPaging & { items: FormattedTrack[] }
  spotifyRecently: {
    next: number /** getMyRecentlyPlayedTracks option params */
    total: SpotifyApi.UsersRecentlyPlayedTracksResponse['total']
  }

  chosenName: string | undefined
  chosenList: FormattedTrack[]

  specifyId: string
  chosenModule: keyof SpotifyTopLists | 'spotifyList' | 'spotifyLiked' | 'spotifyRecently'
}

export const usePersonalPlaylistStore = defineStore('PersonalPlaylistStore', {
  state: (): PersonalPlaylistStoreState => {
    const topTracks = spotifyTopListNames.reduce<SpotifyTopLists>((acc, listName) => {
      return {
        ...acc,
        [listName]: {
          list: [],
          total: 0,
          next: 0,
          offset: 0,
        },
      }
    }, {} as SpotifyTopLists)

    return {
      spotifyList: {
        // 不儲存 list，直接送到 choosen list
        offset: 0,
        total: 0,
        next: '',
      },
      spotifyLiked: {
        items: [],
        total: 0,
        offset: 0,
        next: '',
      },
      spotifyPlaylists: [],
      spotifyRecently: {
        next: 0,
        total: 0,
      },
      ...topTracks,

      chosenName: '',
      chosenList: [],
      specifyId: '',
      chosenModule: 'spotifyList',
    }
  },
  getters: {
    chosenTotal: state => state[`${state.chosenModule}`].total,
    chosenNext: state => state[`${state.chosenModule}`].next,
  },
  actions: {
    async _fetch_spotifyList(isFirst: boolean) {
      await spotifyAPI
        .getPlaylistTracks(this.specifyId, {
          fields: playlistFields,
          limit: increaseOffset,
          ...(!isFirst && { offset: this.spotifyList.offset + increaseOffset }),
        })
        .then(({ items, next, offset, total }) => {
          this.spotifyList = { ...this.spotifyList, next, offset, total }
          const transferResult = items.map(i => playlistTrackFormater(i.track as SpotifyApi.TrackObjectFull))
          this.chosenList.concat(transferResult)
        })
    },
    async _fetch_spotifyLiked(isFirst: boolean) {
      const offset = this.spotifyLiked.offset
      const listLength = this.spotifyLiked.items.length
      if (isFirst && listLength) {
        this.chosenList = this.spotifyLiked.items
        return Promise.resolve()
      }

      await spotifyAPI
        .getMySavedTracks({
          limit: increaseOffset,
          ...(!isFirst && { offset: offset + increaseOffset }),
        })
        .then(({ items, offset, next, total }) => {
          const transferResult = items.map(i => playlistTrackFormater(i.track))
          this.spotifyLiked = {
            next,
            offset,
            total,
            items: this.spotifyLiked.items.concat(transferResult),
          }
          this.chosenList = this.spotifyLiked.items
        })
    },
    async _fetch_spotifyRecently(isFirst: boolean) {
      await spotifyAPI
        .getMyRecentlyPlayedTracks({
          limit: increaseOffset,
          ...(!isFirst && { before: this.spotifyRecently.next }),
        })
        .then(({ items, cursors, total }) => {
          const transferResult = items.map(i => playlistTrackFormater(i.track))
          this.chosenList = this.chosenList.concat(transferResult)

          this.spotifyRecently = { next: +(cursors.before ?? 0), total }
        })
    },
    async _fetchTopWithStaging(submoduleName: SpotifyTopListNames, isFirst: boolean) {
      const offset = this[submoduleName].offset
      const listLength = this[submoduleName].items.length
      if (isFirst && listLength) {
        this.chosenList = this[submoduleName].items
        return Promise.resolve()
      }

      await spotifyAPI
        .getMyTopTracks({
          limit: increaseOffset,
          time_range: SpotifyTopListMap[submoduleName],
          ...(!isFirst && { offset: offset + increaseOffset }),
        })
        .then(({ items, offset, next, total }) => {
          const transferResult = items.map(topTrackFormater)
          this[submoduleName] = {
            next,
            offset,
            total,
            items: this[submoduleName].items.concat(transferResult),
          }
          this.chosenList = this[submoduleName].items
        })
    },
    choose(params: { moduleName: PersonalPlaylistStoreState['chosenModule']; specifyId: string }) {
      this.chosenModule = params.moduleName
      this.specifyId = params.specifyId
    },
    getSpotifyLists() {
      spotifyAPI.getUserPlaylists(undefined, { limit: 50 }).then(result => {
        this.spotifyPlaylists = result.items
      })
    },
    fetchFirst() {
      switch (this.chosenModule) {
        case 'spotifyLong':
        case 'spotifyMedium':
        case 'spotifyShort':
          return this._fetchTopWithStaging(this.chosenModule, true)
        default:
          return this[`_fetch_${this.chosenModule}`](true)
      }
    },
    fetchOffset() {
      switch (this.chosenModule) {
        case 'spotifyLong':
        case 'spotifyMedium':
        case 'spotifyShort':
          return this._fetchTopWithStaging(this.chosenModule, false)
        default:
          return this[`_fetch_${this.chosenModule}`](false)
      }
    },
  },
})
