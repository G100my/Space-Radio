import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'customer',
      component: () => import('@/views/Customer.vue'),
    },
    {
      path: '/host',
      name: 'host',
      component: () => import('@/views/Host.vue'),
    },
  ],
})

export default router
