import { handleAuthFromRoute } from 'shared'
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { routeMap } from './constant'
import { hostApi } from './api/cloudFunctionAPI'
import { usePersonalStore } from 'shared'
import { spotifyWrappedAPI } from './api/spotifyWrappedAPI'

const routes: RouteRecordRaw[] = [
  { path: '/', name: routeMap.Index, component: () => import('@/views/index.vue') },
  {
    path: '/',
    component: () => import('@/layouts/HostInner.vue'),
    children: [
      {
        path: routeMap.Sites,
        name: routeMap.Sites,
        component: () => import('@/views/Sites.vue'),
      },
      {
        path: routeMap.Queue,
        name: routeMap.Queue,
        component: () => import('@/views/QueueList.vue'),
      },
      {
        path: routeMap.Logout,
        name: routeMap.Logout,
        component: () => import('@/views/Logout.vue'),
      },
    ],
    beforeEnter: async to => {
      const redirect = await handleAuthFromRoute(to, {
        initRouteName: routeMap.Index,
        validRouteName: routeMap.Queue,
        redirectUrl: routeMap.Queue,
        authRefreshCallback: () => {
          const personalStore = usePersonalStore()
          hostApi.updateAuth(personalStore.id, personalStore.auth!)
        },
        client_id: import.meta.env.VITE_CLIENT_ID,
        spotifyWrappedAPI,
      })
      if (redirect) return redirect
    },
  },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
