import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory('/'),
  routes: [
    { path: '/', name: 'home' },
    { path: '/resume', name: 'resume' },
    { path: '/dashboard', name: 'dashboard' },
  ],
})

export default router
