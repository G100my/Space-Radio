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

const spotifyPlaylist = {
  state: {
    spotifyId: '',
    spotifyOffset: 0,
    spotifyTotal: 0,
    spotifyNext: false,
  },
  getters: {
    playlistGetters: state => type => state[`spotify${type}`],
  },
  mutations: {
    _refreshSpotifyNextOffset(state, { next, offset }) {
      state.spotifyOffset = offset
      state.spotifyNext = Boolean(next)
    },
    _refreshSpotifyId(state, spotifyId) {
      state.spotifyId = spotifyId
    },
  },
  actions: {
    async getSpotifyListContent_first({ commit }, listId) {
      commit('_refreshSpotifyId', listId)
      await spotifyAPI
        .getPlaylistTracks(listId, {
          fields: playlistFields,
        })
        .then(({ items, next, offset, total }) => {
          commit('_refreshSpotifyNextOffset', { next, offset })
          state.spotifyTotal = total

          const transferResult = items.map(reduceDataCallback)
          commit('refreshChosenList', transferResult)
        })
    },
    async getSpotifyListContent_offset({ state, commit, getters }) {
      await spotifyAPI
        .getPlaylistTracks(state.spotifyId, {
          fields: playlistFields,
          offset: getters.playlistGetters('Offset') + increasePplaylistLimet,
          limit: increasePplaylistLimet,
        })
        .then(({ items, next, offset }) => {
          commit('_refreshSpotifyNextOffset', { next, offset })
          const transferResult = items.map(reduceDataCallback)
          commit('refreshChosenList', state.chosenList.concat(transferResult))
        })
    },
  },
}

const spotifyLiked = {
  state: {
    spotifyLiked: [],
    spotifyLikedTotal: 0,
    spotifyLikedOffset: 0,
    spotifyLikedNext: false,
  },
  getters: {
    spotifyLiked(state) {
      return state.spotifyLiked
    },
    spotifyLikedGetters: state => type => state[`spotifyLiked${type}`],
  },
  mutations: {
    _resetSpotifyLikeSongs(state, { tracks, total }) {
      state.spotifyLiked = tracks
      state.spotifyLikedSongsTotal = total
    },
    _increaseSpotifyLikeSongs(state, tracks) {
      state.spotifyLiked = state.spotifyLiked.concat(tracks)
    },
    _refreshSpotifyNextOffset(state, { next, offset }) {
      state.spotifyLikedSongsOffset = offset
      state.spotifyLikedSongsNext = Boolean(next)
    },
  },
  actions: {
    async getSpotifyLikedSongs_first({ commit, getters }) {
      await spotifyAPI.getMySavedTracks().then(({ items, offset, total, next }) => {
        if (total != getters.spotifyLikedGetters('Total')) {
          const transferResult = items.map(reduceDataCallback)
          commit('_resetSpotifyLikeSongs', { tracks: transferResult, total })
          commit('_refreshSpotifyNextOffset', { next, offset })
        }
        commit('refreshChosenList', getters.spotifyLiked)
      })
    },
    async getSpotifyLikedSongs_offset({ commit, getters }) {
      await spotifyAPI
        .getMySavedTracks({ limit: increaseOffset, offset: getters.spotifyLikedGetters('Offset') + increaseOffset })
        .then(({ items, offset, next }) => {
          const transferResult = items.map(reduceDataCallback)
          commit('_increaseSpotifyLikeSongs', transferResult)
          commit('_refreshSpotifyNextOffset', { next, offset })
          commit('refreshChosenList', getters.spotifyLiked)
        })
    },
  },
}

const common = {
  state: {
    spotifyPlaylists: [],

    chosenListName: '',
    chosenList: [],
    chosenPrefix: '',
  },
  getters: {
    spotifyLists(state) {
      return state.spotifyPlaylists
    },
    chosenList(state) {
      return state.chosenList
    },
    listName(state) {
      return state.chosenListName
    },
  },
  mutations: {
    _refreshSpotifyLists(state, newPlaylists) {
      state.spotifyPlaylists = newPlaylists
    },
    refreshChosenList(state, content) {
      state.chosenList = content
    },
    refreshChosenListName(state, listName) {
      state.chosenListName = listName
    },
  },
  actions: {
    getSpotifyLists({ commit }) {
      spotifyAPI.getUserPlaylists({ limit: 50 }).then(result => {
        commit('_refreshSpotifyLists', result.items)
      })
    },
  },
}

export const PersonalPlaylists = [spotifyPlaylist, spotifyLiked, common].reduce(
  (accumulator, submodule) => {
    accumulator.state = { ...accumulator.state, ...submodule.state }
    accumulator.getters = { ...accumulator.getters, ...submodule.getters }
    accumulator.mutations = { ...accumulator.mutations, ...submodule.mutations }
    accumulator.actions = { ...accumulator.actions, ...submodule.actions }
  },
  {
    state: {},
    getters: {},
    mutations: {},
    actions: {},
  }
)
