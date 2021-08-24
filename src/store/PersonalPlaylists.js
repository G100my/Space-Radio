import { playListFields } from '@/utility/fieldString'
import { spotifyAPI } from '@/utility/spotifyAPI'
import { spotifyCoverPicker } from '@/utility/dataFormat'

const reduceDataCallback = i => ({
  album: {
    name: i.track.album.name,
    externalUrl: i.track.album.external_urls.spotify,
    coverUrl: spotifyCoverPicker(i.track.album.images),
  },
  artists: i.track.artists,
  id: i.track.id,
  name: i.track.name,
})

const increaseOffset = 20

export const PersonalPlaylists = {
  state: {
    spotifyLists: [],

    spotifyLikedSongs: [],
    spotifyLikedSongsTotal: 0,
    spotifyLikedSongsOffset: 0,
    spotifyLikedSongsNext: false,

    chosenListName: '',
    chosenList: [],
  },
  getters: {
    spotifyLists(state) {
      return state.spotifyLists
    },
    chosenList(state) {
      return state.chosenList
    },
    listName(state) {
      return state.chosenListName
    },
    _sLikeOffset(state) {
      return state.spotifyLikedSongsOffset
    },
    _sLikeTotal(state) {
      return state.spotifyLikedSongsTotal
    },
    _sLike(state) {
      return state.spotifyLikedSongs
    },
    spotifyLikedNext(state) {
      return state.spotifyLikedSongsNext
    },
  },
  mutations: {
    _refreshSpotifyLists(state, newPlaylists) {
      state.spotifyLists = newPlaylists
    },
    refreshChosenList(state, content) {
      state.chosenList = content
    },
    refreshChosenListName(state, listName) {
      state.chosenListName = listName
    },
    _resetSpotifyLikeSongs(state, { tracks, total }) {
      state.spotifyLikedSongs = tracks
      state.spotifyLikedSongsTotal = total
    },
    _increaseSpotifyLikeSongs(state, tracks) {
      state.spotifyLikedSongs = state.spotifyLikedSongs.concat(tracks)
    },
    _refreshSpotifyNextOffset(state, { next, offset }) {
      state.spotifyLikedSongsOffset = offset
      state.spotifyLikedSongsNext = Boolean(next)
    },
  },
  actions: {
    getSpotifyLists({ commit }) {
      spotifyAPI.getUserPlaylists({ limit: 50 }).then(result => {
        commit('_refreshSpotifyLists', result.items)
      })
    },
    async getSpotifyListContent({ commit }, listId) {
      await spotifyAPI
        .getPlaylist(listId, {
          fields: playListFields,
        })
        .then(result => {
          const transferResult = result.tracks.items.map(reduceDataCallback)
          commit('refreshChosenList', transferResult)
        })
    },
    async getSpotifyLikedSongs_first({ commit, getters }) {
      await spotifyAPI.getMySavedTracks().then(({ items, offset, total, next }) => {
        if (total != getters._sLikeTotal) {
          const transferResult = items.map(reduceDataCallback)
          commit('_resetSpotifyLikeSongs', { tracks: transferResult, total })
          commit('_refreshSpotifyNextOffset', { next, offset })
        }
        commit('refreshChosenList', getters._sLike)
      })
    },
    async getSpotifyLikedSongs_offset({ commit, getters }) {
      await spotifyAPI
        .getMySavedTracks({ limit: increaseOffset, offset: getters._sLikeOffset + increaseOffset })
        .then(({ items, offset, next }) => {
          const transferResult = items.map(reduceDataCallback)
          commit('_increaseSpotifyLikeSongs', transferResult)
          commit('_refreshSpotifyNextOffset', { next, offset })
          commit('refreshChosenList', getters._sLike)
        })
    },
  },
}
