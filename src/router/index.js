import { createRouter, createWebHashHistory } from 'vue-router'
import RoomQueue from '../views/RoomQueue.vue'
import Room from '../views/Room.vue'
import Doorscope from '../views/Doorscope.vue'

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
    ],
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
