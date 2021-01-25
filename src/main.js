import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import spotifyAPI from './plugin/spotify-web-api.js'

// prettier-ignore
createApp(App)
  .use(router)
  .use(spotifyAPI)
  .mount('#app')
