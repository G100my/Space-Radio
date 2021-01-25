import { createRouter, createWebHashHistory } from 'vue-router'

const routes = []

const router = createRouter({
  // 因為是沒有 backend server 的 single page application，使用 hash 來處理 router
  history: createWebHashHistory(),
  routes,
})

export default router
