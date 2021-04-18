import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store/'
import spotifyPlugin from './plugin/spotify-web-api.js'
import './index.css'

// prettier-ignore
createApp(App)
  .use(router)
  .use(store)
  .use(spotifyPlugin)
  .mount('#app')
