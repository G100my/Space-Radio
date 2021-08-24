import { playlistFields } from '@/utility/fieldString'
import { spotifyAPI } from '@/utility/spotifyAPI'
import { spotifyCoverPicker } from '@/utility/dataFormat'
import { state } from './Queue'

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
const increasePplaylistLimet = 100

export const PersonalPlaylists = {
  state: {
    spotifyLists: [],

    spotifyLikedSongs: [],
    spotifyLikedSongsTotal: 0,
    spotifyLikedSongsOffset: 0,
    spotifyLikedSongsNext: false,

    playlistOffset: 0,
    playlistTotal: 0,
    playlistNext: false,
    playlistId: '',

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
    _playlistGetters: state => type => state[`playlist${type}`],
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
    _refreshPlaylistNextOffset(state, { next, offset }) {
      state.playlistOffset = offset
      state.playlistNext = Boolean(next)
    },
    _refreshPlaylistId(state, playlistId) {
      state.playlistId = playlistId
    },
  },
  actions: {
    getSpotifyLists({ commit }) {
      spotifyAPI.getUserPlaylists({ limit: 50 }).then(result => {
        commit('_refreshSpotifyLists', result.items)
      })
    },
    async getSpotifyListContent_first({ commit }, listId) {
      commit('_refreshPlaylistId', listId)
      await spotifyAPI
        .getPlaylistTracks(listId, {
          fields: playlistFields,
        })
        .then(({ items, next, offset, total }) => {
          commit('_refreshPlaylistNextOffset', { next, offset })
          state.playlistTotal = total

          const transferResult = items.map(reduceDataCallback)
          commit('refreshChosenList', transferResult)
        })
    },
    async getSpotifyListContent_offset({ state, commit, getters }) {
      await spotifyAPI
        .getPlaylistTracks(state.playlistId, {
          fields: playlistFields,
          offset: getters._playlistGetters('Offset') + increasePplaylistLimet,
          limit: increasePplaylistLimet,
        })
        .then(({ items, next, offset }) => {
          commit('_refreshPlaylistNextOffset', { next, offset })
          const transferResult = items.map(reduceDataCallback)
          commit('refreshChosenList', state.chosenList.concat(transferResult))
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
