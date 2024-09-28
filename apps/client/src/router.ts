import { handleAuthFromRoute } from 'shared'
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { routeMap } from './constant'
import { setSpaceSite } from './utils'
import { spotifyWrappedAPI } from './api/spotifyWrappedAPI'

const routes: RouteRecordRaw[] = [
  {
    path: '/:space',
    name: routeMap.Login,
    component: () => import('@/views/Login.vue'),
    beforeEnter: to => {
      const spaceName = to.params.space
      if (spaceName) {
        setSpaceSite({ site: to.query.site as string, space: spaceName as string })
      } else {
        return { name: routeMap.NotFound }
      }
    },
  },
  {
    path: '/:space',
    component: () => import('@/layouts/CustomerInner.vue'),
    children: [
      { path: '/search', name: routeMap.Search, component: () => import('@/views/SearchMusic.vue') },
      { path: '/playing', name: routeMap.Playing, component: () => import('@/views/NowPlaying.vue') },
      { path: '/collects', name: routeMap.Collections, component: () => import('@/views/Collects.vue') },
      { path: '/my-playlist', name: routeMap.Playlist, component: () => import('@/views/MyPlaylist.vue') },
      { path: '/tracks/:type/:uri?', name: routeMap.Tracks, component: () => import('@/views/Tracks.vue') },
    ],
    beforeEnter: (to, from) => {
      if (import.meta.env.DEV) console.log(to, from)

      const spaceName = to.params.space
      if (typeof spaceName === 'string') {
        if (spaceName) {
          console.warn('Recorded site and space:', to.query.site, to.params.space)
          setSpaceSite({ space: spaceName })
        }
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
