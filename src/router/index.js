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
    component: Doorscope,
  },
  {
    path: '/room',
    name: 'Room',
    component: Room,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'playlist-content',
        name: 'PlaylistContent',
        component: PlaylistContent,
      },
      {
        path: 'room-queue',
        name: 'RoomQueue',
        component: RoomQueue,
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
