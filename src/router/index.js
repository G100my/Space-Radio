import { createRouter, createWebHashHistory } from 'vue-router'
import { spotifyAPI } from '../plugin/spotify-web-api.js'
import store from '../store/'
import RoomQueue from '../views/RoomQueue.vue'
import Room from '../views/Room.vue'
import Doorscope from '../views/Doorscope.vue'

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

router.beforeEach(to => {
  if (to.fullPath.includes('access_token')) {
    const hash = to.fullPath
    const expires_in = Number(hash.slice(hash.search(/(?<=expires_in=)[\w+]/))) * 1000
    const expiredTime = expires_in + Date.now()

    const newToken = hash.substring(hash.search(/(?<=access_token=)[\w+]/), hash.indexOf('&token_type'))
    store.commit('refreshToken', { newToken, expiredTime })
    spotifyAPI.setAccessToken(newToken)
    spotifyAPI.getMe().then(result => {
      store.commit('updateUserData', result)
    })
    return { name: 'Room' }
  }

  if (!to.meta.requiresAuth && store.getters.isTokenValid) {
    return { name: 'Room' }
  }

  if (to.meta.requiresAuth && !store.getters.isTokenValid) {
    return { name: 'Doorscope' }
  }
})

export default router
