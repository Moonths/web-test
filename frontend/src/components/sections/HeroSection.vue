<template>
  <section id="hero" class="hero" ref="heroRef">
    <div class="container hero__inner">
      <p class="hero__eyebrow">你好，我是</p>
      <h1 class="hero__title" data-text="毛际可">毛际可</h1>
      <p class="hero__subtitle" ref="subtitleRef">高级前端工程师 · 10年经验</p>
      <p class="hero__desc">10年+企业级与 AI 原生应用开发经验，擅长 Vue3 全家桶及 TypeScript 工程化体系建设。具备跨端开发能力（uni-app / 小程序），主导过集团级 ERP 与仓储管理等复杂后台系统，同时具备 NestJS BFF 层开发能力。</p>
      <div class="hero__actions">
        <a class="btn btn--primary" href="#projects">查看项目</a>
        <a class="btn btn--ghost" href="#contact">联系我</a>
        <a
          class="btn btn--download"
          href="https://maojike.oss-cn-beijing.aliyuncs.com/%E6%AF%9B%E9%99%85%E5%8F%AF_%E5%89%8D%E7%AB%AF%E5%B7%A5%E7%A8%8B%E5%B8%88%E7%AE%80%E5%8E%86.docx"
          download="毛际可_前端工程师简历.docx"
          target="_blank"
          rel="noopener noreferrer"
        >下载简历</a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMatrixRain } from '@/composables/useMatrixRain'

const heroRef = ref<HTMLElement | null>(null)
const subtitleRef = ref<HTMLElement | null>(null)
useMatrixRain(heroRef, subtitleRef)
</script>
