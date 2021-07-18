import { spotifyAPI } from '@/utility/spotifyAPI'

export const PersonalPlaylists = {
  state: {
    spotifyLists: [],
  },
  getters: {
    spotifyLists(state) {
      return state.spotifyLists
    },
  },
  mutations: {
    _refreshSpotifyLists(state, newPlaylists) {
      state.spotifyLists = newPlaylists
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
