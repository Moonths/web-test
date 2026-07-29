<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const navItems = [
  { path: '/resume', label: '简历' },
  { path: '/city', label: '数字城市' },
  { path: '/dashboard', label: '数据大屏' },
  { path: '/admin', label: '管理后台', hidden: true },
]

const isActive = (path: string) => {
  return (route.path.startsWith(path)) ? 'is-active' : ''
}

function navigate(path: string) {
  router.push(path)
}
</script>

<template>
  <div class="portal-root">
    <header class="portal-header">
      <div class="portal-nav">
        <span class="portal-brand" @click="navigate('/resume')">毛际可</span>
        <nav class="portal-nav__menu">
          <a
            v-for="item in navItems"
            :key="item.path"
            :class="[isActive(item.path), { 'portal-nav--hidden': item.hidden }]"
            @click.prevent="navigate(item.path)"
          >
            {{ item.label }}
          </a>
        </nav>
      </div>
    </header>
    <main class="portal-main">
      <router-view />
    </main>
  </div>
</template>
