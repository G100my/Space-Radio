import { playListFields } from '@/utility/fieldString'
import { spotifyAPI } from '@/utility/spotifyAPI'
import ImageVinylRecord from '@/assets/vinyl-record.png'

export const PersonalPlaylists = {
  state: {
    spotifyLists: [],

    chosenListName: '',
    chosenList: [],
  },
  getters: {
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
    _refreshChosenList(state, content) {
      state.chosenList = content
    },
    _refreshChosenListName(state, listName) {
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
          commit('_refreshChosenListName', result.name)
          const transferResult = result.tracks.items.map(i => ({
            album: {
              name: i.track.album.name,
              externalUrl: i.track.album.external_urls.spotify,
              coverUrl: i.track.album.images.length
                ? i.track.album.images[i.track.album.images.length - 1].url
                : ImageVinylRecord,
            },
            artists: i.track.artists,
            id: i.track.id,
            name: i.track.name,
          }))
          console.log(transferResult)
          commit('_refreshChosenList', transferResult)
        })
    },
  },
}
