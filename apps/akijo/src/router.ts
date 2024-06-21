import { handleAuthFromRoute } from '@/api/spotifyWrappedAPI'
import { usePersonalStore } from 'shared'
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

export const routeMap = {
  C_login: 'login',
  C_search: 'search',
  C_playing: 'playing',
  C_collects: 'collects',
  C_playlist: 'my-playlist',
  C_tracks: 'tracks',
  H_login: 'host',
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
      { path: 'tracks/:type/:uri?', name: routeMap.C_tracks, component: () => import('@/views/customer/Tracks.vue') },
    ],
    beforeEnter: (to, from) => {
      if (import.meta.env.DEV) console.log(to, from)

      const redirect = handleAuthFromRoute(to)
      if (redirect) return redirect
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
