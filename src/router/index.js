import { createRouter, createWebHashHistory } from 'vue-router'
import RoomQueue from '../views/RoomQueue.vue'
import Room from '../views/Room.vue'
import Doorscope from '../views/Doorscope.vue'
import SearchResult from '../views/SearchResult.vue'
import PlaylistContent from '../views/PlaylistContent.vue'

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
      {
        path: 'playlist-content',
        name: 'PlaylistContent',
        component: PlaylistContent,
      },
      {
        path: 'search-result',
        name: 'SearchResult',
        component: SearchResult,
      },
    ],
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
