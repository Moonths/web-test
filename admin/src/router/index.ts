import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory('/admin/'),
  routes: [
    {
      path: '/login',
      component: () => import('@/views/LoginView.vue'),
    },
    {
      path: '/',
      component: () => import('@/views/EditorView.vue'),
      meta: { requiresAuth: true },
    },
    { path: '/logs',      component: () => import('@/views/LogsView.vue'),      meta: { requiresAuth: true } },
    { path: '/interests', component: () => import('@/views/InterestsView.vue'), meta: { requiresAuth: true } },
    { path: '/slots',     component: () => import('@/views/SlotsView.vue'),     meta: { requiresAuth: true } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.token) return '/login'
})

export default router
