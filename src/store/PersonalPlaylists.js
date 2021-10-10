import { playlistFields } from '@/utility/fieldString'
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
const increasePplaylistLimet = 100

const spotifyList = {
  state: {
    spotifyList: {
      // 不儲存 list，直接送到 choosen list
      offset: 0,
      total: 0,
      next: false,
    },
  },
  mutations: {
    _spotifyList(state, value) {
      state.spotifyList = { ...state.spotifyList, ...value }
    },
  },
  actions: {
    async _getFirst_spotifyList({ commit, getters }) {
      await spotifyAPI
        .getPlaylistTracks(getters.specifyId, {
          fields: playlistFields,
        })
        .then(({ items, next, offset, total }) => {
          commit('_spotifyList', { next, offset, total })
          const transferResult = items.map(reduceDataCallback)
          commit('chosenList', transferResult)
        })
    },
    async _getOffset_spotifyList({ commit, getters, state }) {
      await spotifyAPI
        .getPlaylistTracks(getters.specifyId, {
          fields: playlistFields,
          offset: state.spotifyList.offset + increasePplaylistLimet,
          limit: increasePplaylistLimet,
        })
        .then(({ items, next, offset }) => {
          commit('_spotifyList', { next, offset })
          const transferResult = items.map(reduceDataCallback)
          commit('chosenList', getters.chosenList.concat(transferResult))
        })
    },
  },
}

const spotifyLiked = {
  state: {
    spotifyLiked: {
      list: [],
      total: 0,
      offset: 0,
      next: false,
    },
  },
  mutations: {
    spotifyLiked(state, value) {
      state.spotifyLiked = { ...state.spotifyLiked, ...value }
    },
  },
  actions: {
    // 如果總數沒有改變，不重新下載
    async _getFirst_spotifyLiked({ commit, state }) {
      await spotifyAPI.getMySavedTracks().then(({ items, offset, total, next }) => {
        if (total != state.spotifyLiked.total) {
          const transferResult = items.map(reduceDataCallback)
          commit('spotifyLiked', { next, offset, list: transferResult, total })
        }
        commit('chosenList', state.spotifyLiked.list)
      })
    },
    async _getOffset_spotifyLiked({ commit, state }) {
      await spotifyAPI
        .getMySavedTracks({ limit: increaseOffset, offset: state.spotifyLiked.offset + increaseOffset })
        .then(({ items, offset, next }) => {
          const transferResult = items.map(reduceDataCallback)
          commit('spotifyLiked', {
            next,
            offset,
            list: state.spotifyLiked.list.concat(transferResult),
          })
          commit('chosenList', state.spotifyLiked.list)
        })
    },
  },
}

const common = {
  state: {
    spotifyPlaylists: [],

    chosenName: '',
    chosenList: [],
    chosenTotal: 0,

    specifyId: '',
    chosenModule: '',
  },
  getters: {
    spotifyLists(state) {
      return state.spotifyPlaylists
    },
    chosenList(state) {
      return state.chosenList
    },
    chosenName(state) {
      return state.chosenName
    },
    chosenTotal(state) {
      return state[`${state.chosenModule}`].total
    },
    chosenNext(state) {
      return state[`${state.chosenModule}`].next
    },
    specifyId(state) {
      return state.specifyId
    },
    chosenModule(state) {
      return state.chosenModule
    },
  },
  mutations: {
    _spotifyLists(state, newPlaylists) {
      state.spotifyPlaylists = newPlaylists
    },
    chosenList(state, content) {
      state.chosenList = content
    },
    chosenListName(state, listName) {
      state.chosenName = listName
    },
    chosenModule(state, { module, specifyId }) {
      state.chosenModule = module
      if (specifyId) state.specifyId = specifyId
      else state.specifyId = ''
    },
  },
  actions: {
    getSpotifyLists({ commit }) {
      spotifyAPI.getUserPlaylists({ limit: 50 }).then(result => {
        commit('_spotifyLists', result.items)
      })
    },
    fetchFirst({ dispatch, state }) {
      return dispatch(`_getFirst_${state.chosenModule}`)
    },
    fetchOffset({ dispatch, state }) {
      return dispatch(`_getOffset_${state.chosenModule}`)
    },
  },
}

export const PersonalPlaylists = [spotifyList, spotifyLiked, common].reduce(
  (accumulator, submodule) => {
    accumulator.state = { ...accumulator.state, ...submodule.state }
    accumulator.getters = { ...accumulator.getters, ...submodule.getters }
    accumulator.mutations = { ...accumulator.mutations, ...submodule.mutations }
    accumulator.actions = { ...accumulator.actions, ...submodule.actions }
    return accumulator
  },
  {
    state: {},
    getters: {},
    mutations: {},
    actions: {},
  }
)
