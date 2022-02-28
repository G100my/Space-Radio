import { playlistFields } from '@/utility/fieldString'
import { spotifyAPI } from '@/utility/spotifyAPI'
import { playlistTrackFormater, topTrackFormater } from '@/utility/dataFormat'

const increaseOffset = 25

const fetchTopWithStaging = async ({ commit, state }, isFirst, submoduleName, time_range) => {
  const offset = state[submoduleName].offset
  const listLength = state[submoduleName].list.length
  if (isFirst && listLength) {
    commit('chosenList', state[submoduleName].list)
    return Promise.resolve()
  }

  await spotifyAPI
    .getMyTopTracks({
      limit: increaseOffset,
      time_range,
      ...(!isFirst && { offset: offset + increaseOffset }),
    })
    .then(({ items, offset, next, total }) => {
      const transferResult = items.map(topTrackFormater)
      commit(submoduleName, {
        next,
        offset,
        total,
        list: state[submoduleName].list.concat(transferResult),
      })
      commit('chosenList', state[submoduleName].list)
    })
}

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
    async _fetch_spotifyList({ commit, getters, state }, isFirst) {
      await spotifyAPI
        .getPlaylistTracks(getters.specifyId, {
          fields: playlistFields,
          limit: increaseOffset,
          ...(!isFirst && { offset: state.spotifyList.offset + increaseOffset }),
        })
        .then(({ items, next, offset, total }) => {
          commit('_spotifyList', { next, offset, total })
          const transferResult = items.map(playlistTrackFormater)
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
    async _fetch_spotifyLiked({ commit, state }, isFirst) {
      const offset = state.spotifyLiked.offset
      const listLength = state.spotifyLiked.list.length
      if (isFirst && listLength) {
        commit('chosenList', state.spotifyLiked.list)
        return Promise.resolve()
      }

      await spotifyAPI
        .getMySavedTracks({
          limit: increaseOffset,
          ...(!isFirst && { offset: offset + increaseOffset }),
        })
        .then(({ items, offset, next, total }) => {
          const transferResult = items.map(playlistTrackFormater)
          commit('spotifyLiked', {
            next,
            offset,
            total,
            list: state.spotifyLiked.list.concat(transferResult),
          })
          commit('chosenList', state.spotifyLiked.list)
        })
    },
  },
}

const spotifyRecently = {
  state: {
    spotifyRecently: {
      next: 0,
    },
  },
  mutations: {
    spotifyRecently(state, value) {
      state.spotifyRecently = { next: value }
    },
  },
  actions: {
    async _fetch_spotifyRecently({ commit, getters, state }, isFirst) {
      await spotifyAPI
        .getMyRecentlyPlayedTracks({
          limit: increaseOffset,
          ...(!isFirst && { before: state.spotifyRecently.next }),
        })
        .then(({ items, cursors }) => {
          const transferResult = items.map(playlistTrackFormater)
          commit('chosenList', getters.chosenList.concat(transferResult))

          commit('spotifyRecently', cursors ? cursors.before : null)
        })
    },
  },
}

const topTracks = ['spotifyLong', 'spotifyMedium', 'spotifyShort'].map(listName => ({
  state: {
    [listName]: {
      list: [],
      total: 0,
      next: 0,
      offset: 0,
    },
  },
  mutations: {
    [listName]: function (state, value) {
      state[listName] = { ...state.listName, ...value }
    },
  },
  actions: {
    [`_fetch_${listName}`]: (context, payload) => fetchTopWithStaging(context, payload, listName, listName),
  },
}))

const common = {
  state: {
    spotifyPlaylists: [],

    chosenName: '',
    chosenList: [],

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
      return dispatch(`_fetch_${state.chosenModule}`, true)
    },
    fetchOffset({ dispatch, state }) {
      return dispatch(`_fetch_${state.chosenModule}`, false)
    },
  },
}

export const PersonalPlaylists = [spotifyList, spotifyLiked, spotifyRecently, ...topTracks, common].reduce(
  (accumulator, submodule) => {
    accumulator.state = { ...accumulator.state, ...submodule.state }
    accumulator.mutations = { ...accumulator.mutations, ...submodule.mutations }
    accumulator.actions = { ...accumulator.actions, ...submodule.actions }
    return accumulator
  },
  {
    state: {},
    getters: common.getters,
    mutations: {},
    actions: {},
  }
)
