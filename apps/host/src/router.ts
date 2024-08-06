import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { routeMap } from './constant'
import { auth } from '@/plugins/firebase'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: routeMap.Index,
    component: () => import('@/views/index.vue'),
    beforeEnter: () => {
      return auth
        .authStateReady()
        .then(() => {
          if (auth.currentUser) return { name: routeMap.Queue }
          else return true
        })
        .catch(() => true)
    },
  },
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
        path: routeMap.Auth,
        name: routeMap.Auth,
        component: () => import('@/views/Settings.vue'),
      },
    ],
    beforeEnter: async () => {
      return await auth
        .authStateReady()
        .then(() => {
          if (!auth.currentUser) return Promise.reject()
          else return true
        })
        .catch(() => ({ name: routeMap.Index }))
    },
  },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
