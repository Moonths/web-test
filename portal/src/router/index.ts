import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory('/'),
  routes: [
    { path: '/', redirect: '/resume' },
    {
      path: '/resume/:pathMatch(.*)*',
      name: 'resume',
      component: () => import('../views/SubAppView.vue'),
      meta: { title: '简历' },
    },
    {
      path: '/city/:pathMatch(.*)*',
      name: 'digital-city',
      component: () => import('../views/SubAppView.vue'),
      meta: { title: '数字城市' },
    },
    {
      path: '/dashboard/:pathMatch(.*)*',
      name: 'dashboard',
      component: () => import('../views/SubAppView.vue'),
      meta: { title: '数据大屏' },
    },
    {
      path: '/admin/:pathMatch(.*)*',
      name: 'admin',
      component: () => import('../views/SubAppView.vue'),
      meta: { title: '管理', hidden: true },   // hidden: 不显示在导航
    },
    { path: '/:pathMatch(.*)*', redirect: '/resume' },
  ],
})

export default router
