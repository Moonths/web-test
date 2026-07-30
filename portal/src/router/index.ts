import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'hall',
    component: () => import('@/views/HallView.vue'),
  },
  {
    path: '/resume',
    name: 'resume',
    component: () => import('@/views/ResumeView.vue'),
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
