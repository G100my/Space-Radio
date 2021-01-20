import { createApp } from 'vue'
import App from './App.vue'
import spotifyAPI from './plugin/spotify-web-api.js'

// prettier-ignore
createApp(App)
  .use(spotifyAPI)
  .mount('#app')
