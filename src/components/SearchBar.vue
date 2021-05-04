<template>
  <div class="flex items-center">
    <SearchIcon />
    <input
      v-model="searchText"
      type="text"
      autocomplete="off"
      @keydown.prevent.enter="searchHandler"
      @keydown.prevent.esc="searchText = ''"
    />
    <button class="cancel-search-button" type="button" @click="searchText = ''">
      <XCircleIcon />
    </button>
  </div>
</template>
<script>
import { ref } from 'vue'
import { spotifyAPI } from '../plugin/spotify-web-api'
import { SearchIcon, XCircleIcon } from '@heroicons/vue/outline'

export default {
  components: {
    SearchIcon,
    XCircleIcon,
  },
  emits: ['triggerAdditionDisplay', 'triggerSearchStyle', 'updateAdditionDisplaySource'],
  setup(_props, { emit }) {
    const searchText = ref('')
    const spotifyURL = 'https://open.spotify.com/'
    const reg = new RegExp(`(?<=${spotifyURL})[\\w+]`)

    function searchHandler() {
      if (searchText.value === '') return

      if (searchText.value.startsWith(spotifyURL)) {
        const stringArray = searchText.value.slice(searchText.value.search(reg)).split('/')
        const dataType = stringArray[0]
        const dataId = stringArray[1].slice(0, stringArray[1].indexOf('?'))
        let methodsType
        let resultArray

        switch (dataType) {
          case 'track':
            methodsType = 'getTrack'
            break

          case 'album':
            methodsType = 'getAlbumTracks'
            break

          default:
            console.warn(`not support this uri type: ${dataType}`)
            break
        }
        console.log(methodsType, dataType)
        spotifyAPI[methodsType](dataId, (error, success) => {
          error && console.error('error in search', error)
          console.log(success)
          if (success) {
            if (dataType === 'track') resultArray = [success]
            else resultArray = success.tracks.items
            emit('updateAdditionDisplaySource', resultArray)
            console.log(resultArray)
          }
        })
      } else {
        spotifyAPI.search(searchText.value, ['track'], { market: 'from_token', limit: 50 }, (error, success) => {
          error && console.log(error.response)
          console.log(success)
          success && emit('updateAdditionDisplaySource', success.tracks.items)
        })
      }
    }

    return {
      searchText,
      searchHandler,
    }
  },
}
</script>
