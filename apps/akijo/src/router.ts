import { spotifyAPI } from '@/plugins/spotifyAPI'
import { generateAuthParams } from '@/utils'
import { fetchAccessToken, refreshAccessToken, usePersonalStore } from 'shared'
import { storageKeys } from 'shared/stores/usePersonalStore'
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

export const routeMap = {
  C_login: 'login',
  C_search: 'search',
  C_playing: 'playing',
  C_collects: 'collects',
  C_playlist: 'my-playlist',
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'customer',
    component: () => import('@/views/customer/index.vue'),
    children: [
      { path: '', name: routeMap.C_login, component: () => import('@/views/customer/LoginIn.vue') },
      { path: 'search', name: routeMap.C_search, component: () => import('@/views/customer/SearchMusic.vue') },
      { path: 'playing', name: routeMap.C_playing, component: () => import('@/views/customer/NowPlaying.vue') },
      { path: 'collects', name: routeMap.C_collects, component: () => import('@/views/customer/Collects.vue') },
      { path: 'my-playlist', name: routeMap.C_playlist, component: () => import('@/views/customer/MyPlaylist.vue') },
    ],
    beforeEnter: (to, from) => {
      const personalStore = usePersonalStore()
      if (import.meta.env.DEV) {
        console.log(to, from)
        console.log(personalStore.$state)
      }

      if (personalStore.isTokenValid()) {
        if (!spotifyAPI.getAccessToken()) spotifyAPI.setAccessToken(personalStore.access_token)
        if (to.name === routeMap.C_login) return { name: routeMap.C_playing }
      } else {
        const authorization_code = to.query.code as string | undefined
        console.log('🚀 ~ authorization_code:', authorization_code)
        const refreshToken = localStorage.getItem(storageKeys.refreshToken)
        console.log('🚀 ~ refreshToken:', refreshToken)
        if (authorization_code) {
          return fetchAccessToken(authorization_code, generateAuthParams(routeMap.C_playing))
            .then(res => personalStore.updateToken(res))
            .then(() => ({ name: routeMap.C_playing }))
        } else if (refreshToken) {
          return refreshAccessToken({ refresh_token: refreshToken, client_id: import.meta.env.VITE_CLIENT_ID }).then(
            () => true
          )
        } else if (to.name !== routeMap.C_login) return { name: routeMap.C_login }
      }
    },
  },
  {
    path: '/host',
    component: () => import('@/views/host/index.vue'),
  },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})