<template>
  <section id="hero" class="hero" ref="heroRef">
    <!-- 2D Matrix Rain canvas (default) -->
    <!-- inserted by useMatrixRain -->

    <!-- 3D canvas layer -->
    <canvas
      ref="canvas3dRef"
      class="hero__canvas3d"
      :class="{ 'hero__canvas3d--visible': is3D && scene3dState === 'ready' }"
      aria-hidden="true"
    />

    <!-- 2D/3D toggle -->
    <button
      class="view-toggle"
      :class="{ 'view-toggle--loading': is3D && scene3dState === 'loading' }"
      :aria-label="is3D ? '切换到 2D 视图' : '切换到 3D 视图'"
      :aria-pressed="is3D"
      @click="toggleMode"
    >
      <span class="view-toggle__track">
        <span class="view-toggle__thumb" />
      </span>
      <span class="view-toggle__label view-toggle__label--2d" :class="{ active: !is3D }">2D</span>
      <span class="view-toggle__label view-toggle__label--3d" :class="{ active: is3D }">3D</span>
      <span v-if="is3D && scene3dState === 'loading'" class="view-toggle__spinner" aria-hidden="true" />
    </button>

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
import { ref, watch } from 'vue'
import { useMatrixRain } from '@/composables/useMatrixRain'
import { use3DScene } from '@/composables/use3DScene'

const heroRef    = ref<HTMLElement | null>(null)
const subtitleRef = ref<HTMLElement | null>(null)
const canvas3dRef = ref<HTMLCanvasElement | null>(null)

const is3D = ref(false)

const { state: scene3dState, activate, deactivate } = use3DScene(canvas3dRef)
useMatrixRain(heroRef, subtitleRef)

function toggleMode() {
  is3D.value = !is3D.value
}

watch(is3D, async (val) => {
  if (val) {
    // hide matrix canvas opacity via class, 3D activates
    heroRef.value?.classList.add('hero--3d')
    await activate()
  } else {
    heroRef.value?.classList.remove('hero--3d')
    deactivate()
  }
})
</script>
