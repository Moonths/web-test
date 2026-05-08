<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useScrollSpy } from '@/composables/useScrollSpy'

const isScrolled = ref(false)
const menuOpen = ref(false)
const { activeId } = useScrollSpy(['hero', 'about', 'skills', 'experience', 'projects', 'contact'])

const navLinks = [
  { href: '#about', label: '关于' },
  { href: '#skills', label: '技能' },
  { href: '#experience', label: '经历' },
  { href: '#projects', label: '项目' },
  { href: '#contact', label: '联系' },
]

function onScroll() { isScrolled.value = window.scrollY > 8 }
function closeMenu(e: MouseEvent) { if (e.target instanceof HTMLAnchorElement) menuOpen.value = false }

onMounted(() => { window.addEventListener('scroll', onScroll, { passive: true }); onScroll() })
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <header class="site-header" :class="{ 'is-scrolled': isScrolled }" id="siteHeader">
    <nav class="nav container" aria-label="主导航">
      <a class="nav__brand" href="#hero">毛际可</a>
      <button
        class="nav__toggle"
        :aria-expanded="menuOpen"
        aria-label="切换菜单"
        @click="menuOpen = !menuOpen"
      >
        <span /><span /><span />
      </button>
      <ul class="nav__menu" :class="{ 'is-open': menuOpen }" @click="closeMenu">
        <li v-for="link in navLinks" :key="link.href">
          <a :href="link.href" :class="{ 'is-active': activeId === link.href.slice(1) }">
            {{ link.label }}
          </a>
        </li>
      </ul>
    </nav>
  </header>
</template>
