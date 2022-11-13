import { createRouter, createWebHashHistory } from 'vue-router'
import store from '@/store'
import Hall from '@/views/Hall.vue'
import Room from '@/views/Room.vue'
import Doorscope from '@/views/Doorscope.vue'
import HallShell from '@/components/hall/HallShell.vue'
import CreateRoom from '@/views/CreateRoom.vue'
import { fetchAccessToken } from '@/utility/PKCE'
import { spotifyAPI } from '@/utility/spotifyAPI'

import { setPlayingStateRef } from '@/store/PlayingState'
import { setUserLogRef } from '@/store/UserLog'
import { setQueueRef } from '@/store/Queue'

const routes = [
  {
    path: '/',
    meta: { requiresAuth: false },
    component: HallShell,
    children: [
      {
        path: '',
        name: 'Hall',
        component: Hall,
      },
      {
        path: '/create',
        name: 'CreateRoom',
        meta: { requiresAuth: true },
        component: CreateRoom,
      },
      {
        path: '/doorscope/:roomKey',
        name: 'Doorscope',
        meta: { requiresAuth: false },
        component: Doorscope,
      },
    ],
    beforeEnter: () => {
      // avoid user refresh page
      if (!spotifyAPI.getAccessToken() && store.getters.isTokenValid) {
        spotifyAPI.setAccessToken(store.getters.token)
      }
    },
  },
  {
    path: '/room',
    name: 'Room',
    component: Room,
    meta: { requiresAuth: true },
    beforeEnter: () => {
      const roomKey = localStorage.getItem('spaceradio_room_key')
      setPlayingStateRef(roomKey)
      setUserLogRef(roomKey)
      setQueueRef(roomKey)
    },
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach(async to => {
  if (window.location.search.includes('?code=')) {
    const [authorizationCode, hashPath] = window.location.href
      .slice(window.location.href.search(/code=/) + 5)
      .split('#/')

    if (!authorizationCode) return

    // spotify 在 PKCE 驗證流程中把資料放在 location.search 的地方，
    // http://somewhere/?code=something...#/
    // 造成 vue router webHashHistory mode 無法如預期運作，
    // to, from 都會是 '/'，因此手動清除。
    window.history.replaceState(null, '', import.meta.env.VITE_REDIRECT_URI)
    await fetchAccessToken(authorizationCode, '#' + hashPath).then(() => {
      spotifyAPI.getMe().then(result => {
        store.commit('userData', result)
      })
    })
  }

  if (window.location.search.includes('?error=')) {
    return { name: 'Hall' }
  }

  if (to.meta.requiresAuth && !store.getters.isTokenValid) {
    return { name: 'Hall' }
  }
})

export default router
