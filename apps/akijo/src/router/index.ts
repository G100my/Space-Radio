import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'customer',
    component: () => import('@/views/customer/index.vue'),
    children: [
      { path: 'search', name: 'search', component: () => import('@/views/customer/SearchMusic.vue') },
      { path: 'playing', name: 'playing', component: () => import('@/views/customer/NowPlaying.vue') },
      { path: 'collects', name: 'collects', component: () => import('@/views/customer/Collects.vue') },
      { path: 'my-playlist', name: 'my-playlist', component: () => import('@/views/customer/MyPlaylist.vue') },
    ],
  },
  {
    path: '/host',
    component: () => import('@/views/host/index.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
