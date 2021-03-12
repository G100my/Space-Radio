import { createRouter, createWebHashHistory } from 'vue-router'
import store from '../store/'
import Room from '../views/Room.vue'
import Doorscope from '../views/Doorscope.vue'
import CreateRoom from '../views/CreateRoom.vue'
import { fetchAccessToken } from '../utility/PKCE.js'
import { spotifyAPI } from '../plugin/spotify-web-api.js'

const routes = [
  {
    path: '/',
    name: 'Lobby',
    meta: { requiresAuth: false },
    component: Doorscope,
  },
  {
    path: '/doorscope/:roomKey',
    name: 'Doorscope',
    meta: { requiresAuth: false },
    component: Doorscope,
  },
  {
    path: '/room',
    name: 'Room',
    component: Room,
    meta: { requiresAuth: true },
  },
  {
    path: '/create',
    name: 'Create',
    component: CreateRoom,
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach(async to => {
  if (window.location.search.includes('?code=')) {
    const [authorizationCode, hashPath] = window.location.href
      .slice(window.location.href.search(/(?<=code=)[\w+]/))
      .split('#/')

    if (!authorizationCode) return

    // spotify 在 PKCE 驗證流程中把資料放在 location.search 的地方，
    // http://somewhere/?code=something...#/
    // 造成 vue router webHashHistory mode 無法如預期運作，
    // to, from 都會是 '/'，因此手動清除。
    window.history.replaceState(null, '', import.meta.env.VITE_REDIRECT_URI)
    await fetchAccessToken(authorizationCode, '#' + hashPath).then(() => {
      spotifyAPI.getMe().then(result => {
        console.log(result)
        store.commit('updateUserData', result)
      })
    })
  }

  if (window.location.search.includes('?error=')) {
    return { name: 'Doorscope' }
  }

  if (to.meta.requiresAuth && !store.getters.isTokenValid) {
    console.log(store.getters.isTokenValid)
    return { name: 'Doorscope' }
  }
})

export default router
