import { playListFields } from '@/utility/fieldString'
import { spotifyAPI } from '@/utility/spotifyAPI'
import { spotifyCoverPicker } from '@/utility/dataFormat'

export const PersonalPlaylists = {
  state: {
    spotifyLists: [],

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
          const transferResult = result.tracks.items.map(i => ({
            album: {
              name: i.track.album.name,
              externalUrl: i.track.album.external_urls.spotify,
              coverUrl: spotifyCoverPicker(i.track.album.images),
            },
            artists: i.track.artists,
            id: i.track.id,
            name: i.track.name,
          }))
          commit('refreshChosenList', transferResult)
        })
    },
  },
}
