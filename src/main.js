import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store/store.js'
import spotifyAPI from './plugin/spotify-web-api.js'

router.beforeEach(to => {
  if (to.fullPath.includes('access_token')) {
    // in Hash History mode
    const hash = to.fullPath
    const expiredTime = Number(hash.slice(hash.search(/(?<=expires_in=)[\w+]/))) + Date.now()
    const newToken = hash.substring(hash.search(/(?<=access_token=)[\w+]/), hash.indexOf('&token_type'))
    store.commit('refreshToken', { newToken, expiredTime })
    const originPath = hash.slice(0, hash.search('access_token='))
    return { path: originPath }
  }
})

// prettier-ignore
createApp(App)
  .use(router)
  .use(store)
  .use(spotifyAPI)
  .mount('#app')
