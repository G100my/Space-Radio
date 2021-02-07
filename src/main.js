import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store/store.js'
import spotifyAPI from './plugin/spotify-web-api.js'

router.beforeEach(to => {
  if (to.fullPath.includes('access_token')) {
    const hash = to.fullPath
    const expires_in = Number(hash.slice(hash.search(/(?<=expires_in=)[\w+]/))) * 1000
    const expiredTime = expires_in + Date.now()

    const newToken = hash.substring(hash.search(/(?<=access_token=)[\w+]/), hash.indexOf('&token_type'))
    store.commit('refreshToken', { newToken, expiredTime })
    const originPath = hash.slice(0, hash.search('access_token='))
    return { path: originPath }
  }

  if (to.meta.requiresAuth && !store.getters.isTokenValid) {
    return { name: 'Doorscope' }
  } else {
    return true
  }
})

// prettier-ignore
createApp(App)
  .use(router)
  .use(store)
  .use(spotifyAPI)
  .mount('#app')
