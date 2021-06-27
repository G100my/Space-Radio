import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store/'
import spotifyPlugin from './utility/spotify-web-api.js'
import './style/index.css'

// prettier-ignore
createApp(App)
  .use(router)
  .use(store)
  .use(spotifyPlugin)
  .mount('#app')
