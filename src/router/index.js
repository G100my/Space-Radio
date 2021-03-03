import { createRouter, createWebHashHistory } from 'vue-router'
import { spotifyAPI } from '../plugin/spotify-web-api.js'
import store from '../store/'
import RoomQueue from '../components/RoomQueue.vue'
import Room from '../views/Room.vue'
import Doorscope from '../views/Doorscope.vue'
import { fetchAccessToken } from '../utility/PKCE.js'

const routes = [
  {
    path: '/',
    name: 'Doorscope',
    meta: { requiresAuth: false },
    component: Doorscope,
  },
  {
    path: '/room',
    component: Room,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Room',
        component: RoomQueue,
      },
    ],
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach(async to => {
  if (window.location.search !== '') {
    const authorizationCode = window.location.href.substring(
      window.location.href.search(/(?<=code=)[\w+]/),
      window.location.href.indexOf('#/')
    )
    if (!authorizationCode) return

    await fetchAccessToken(authorizationCode).then(result => {
      const { access_token, expires_in, refresh_token } = result

      const expiredTime = expires_in * 1000 + Date.now()
      store.commit('refreshToken', { access_token, expiredTime, refresh_token })

      spotifyAPI.setAccessToken(access_token)
      spotifyAPI.getMe().then(result => {
        store.commit('updateUserData', result)
        window.history.replaceState(null, '', '/')
      })
      // spotify 在 PKCE 驗證流程中把資料放在 location.search 的地方，
      // http://somewhere/?code=something...#/
      // 造成 vue router webHashHistory mode 無法如預期運作，
      // to, from 都會是 '/'，因此手動清除。
      window.location.href = window.origin + '/#/room'
      return { name: 'Room' }
    })
  }

  if (!to.meta.requiresAuth && store.getters.isTokenValid) {
    return { name: 'Room' }
  }

  if (to.meta.requiresAuth && !store.getters.isTokenValid) {
    console.log(store.getters.isTokenValid)
    return { name: 'Doorscope' }
  }
})

export default router
