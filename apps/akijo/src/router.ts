import { handleAuthFromRoute } from '@/api/spotifyWrappedAPI'
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { SPOTIFY_HOST_REDIRECT_URI, routeMap } from './constant'
import cloudFunctionAPI from './api/cloudFunctionAPI'
import { usePersonalStore } from 'shared'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
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

      const redirect = handleAuthFromRoute(to, {
        initRouteName: routeMap.C_login,
        validRouteName: routeMap.C_playing,
        redirectUrl: routeMap.C_playing,
      })
      if (redirect) return redirect
    },
  },
  {
    path: '/' + routeMap.H_index,
    children: [
      { path: '', name: routeMap.H_index, component: () => import('@/views/host/index.vue') },
      {
        path: 'settings',
        name: routeMap.H_setting,
        component: () => import('@/views/host/Settings.vue'),
        beforeEnter: async to => {
          const redirect = await handleAuthFromRoute(to, {
            initRouteName: routeMap.H_index,
            validRouteName: routeMap.H_setting,
            redirectUrl: SPOTIFY_HOST_REDIRECT_URI,
            authRefreshCallback: () => {
              const personalStore = usePersonalStore()
              cloudFunctionAPI.updateHostAuth(personalStore.id, personalStore.auth!)
            },
          })
          if (redirect) return redirect
        },
      },
    ],
  },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
