import { handleAuthFromRoute } from 'shared'
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { routeMap } from './constant'
import { setSpaceSite } from './utils'
import { spotifyWrappedAPI } from './api/spotifyWrappedAPI'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: routeMap.Login,
    component: () => import('@/views/Login.vue'),
    beforeEnter: to => {
      if ((!to.query.site || !to.query.space) && !import.meta.env.DEV) {
        return { name: routeMap.NotFound }
      }

      if (to.query.site && to.query.space) {
        setSpaceSite(to.query as { site: string; space: string })
      }
    },
  },
  {
    path: '/',
    component: () => import('@/layouts/CustomerInner.vue'),
    children: [
      { path: 'search', name: routeMap.Search, component: () => import('@/views/SearchMusic.vue') },
      { path: 'playing', name: routeMap.Playing, component: () => import('@/views/NowPlaying.vue') },
      { path: 'collects', name: routeMap.Collections, component: () => import('@/views/Collects.vue') },
      { path: 'my-playlist', name: routeMap.Playlist, component: () => import('@/views/MyPlaylist.vue') },
      { path: 'tracks/:type/:uri?', name: routeMap.Tracks, component: () => import('@/views/Tracks.vue') },
    ],
    beforeEnter: (to, from) => {
      if (import.meta.env.DEV) console.log(to, from)

      const { site, space } = to.query
      if (typeof site === 'string' && typeof space === 'string') {
        console.warn('Recorded site and space:', to.query.site, to.query.space)
        if (site && space) setSpaceSite({ site, space })
        return { ...to, query: undefined }
      }

      const redirect = handleAuthFromRoute(to, {
        client_id: import.meta.env.VITE_CLIENT_ID,
        initRouteName: routeMap.Login,
        validRouteName: routeMap.Search,
        redirectUrl: routeMap.Search,
        spotifyWrappedAPI,
      })
      if (redirect) return redirect
    },
  },
  {
    path: '/404',
    name: routeMap.NotFound,
    component: () => import('@/views/NotFound.vue'),
  },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
