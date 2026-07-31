<script setup lang="ts">
import { ref, computed } from 'vue'
import { useScrollReveal } from '@/composables/useScrollReveal'

const sectionRef = ref<HTMLElement | null>(null)
const { progress, hasBeenVisible } = useScrollReveal(sectionRef, { factor: 1.2 })

// Circle grows from center: 0 -> 100%
const circleScale = computed(() => {
  if (!hasBeenVisible.value) return 0
  const t = Math.min(1, progress.value * 1.6)
  const eased = 1 - Math.pow(1 - t, 3)
  return eased
})

// Circle rotates slightly as it grows
const circleRotate = computed(() => {
  if (!hasBeenVisible.value) return -30
  return -30 + progress.value * 30
})

const contentOpacity = computed(() => {
  if (!hasBeenVisible.value) return 0
  return Math.min(1, progress.value * 2.5 - 0.2)
})
</script>

<template>
  <section id="about" ref="sectionRef" class="about-section">
    <div class="about-section__inner container">
      <!-- Circular centerpiece -->
      <div class="about-section__center">
        <svg
          class="about-section__ring"
          viewBox="0 0 200 200"
          :style="{
            transform: `scale(${0.3 + circleScale * 0.7}) rotate(${circleRotate}deg)`,
            opacity: circleScale,
          }"
        >
          <!-- Outer ring -->
          <circle cx="100" cy="100" r="90" fill="none" stroke="var(--color-accent)" stroke-width="1.5" opacity="0.2" />
          <circle cx="100" cy="100" r="75" fill="none" stroke="var(--color-accent)" stroke-width="1" opacity="0.35" />
          <circle cx="100" cy="100" r="60" fill="none" stroke="var(--color-accent)" stroke-width="2" opacity="0.5" />
          <!-- Inner filled circle -->
          <circle cx="100" cy="100" r="40" fill="var(--color-accent)" opacity="0.1" />
          <!-- Center number -->
          <text x="100" y="112" text-anchor="middle" fill="var(--color-accent)" font-family="var(--font-display)" font-weight="800" font-size="48" opacity="0.7">01</text>
        </svg>
        <!-- Decorative dots orbiting -->
        <div
          class="about-section__dot about-section__dot--1"
          :style="{ opacity: circleScale, transform: `translate(-50%, -50%) rotate(${circleRotate * 3}deg) translateY(-80px)` }"
        />
        <div
          class="about-section__dot about-section__dot--2"
          :style="{ opacity: circleScale, transform: `translate(-50%, -50%) rotate(${-circleRotate * 2}deg) translateY(-65px)` }"
        />
      </div>

      <!-- Left content -->
      <div class="about-section__side about-section__side--left" :style="{ opacity: contentOpacity }">
        <header class="section__head">
          <span class="section__num">01</span>
          <h2 class="section__title">关于我</h2>
        </header>
        <p>资深前端工程师，10年+企业级与 AI 原生应用开发经验，深耕 Vue 2/3 生态与 TypeScript 工程化体系建设。</p>
        <p>主导过集团级 ERP2.0、仓储管理系统、智能文档问答等多个中大型项目，具备 NestJS BFF 层开发能力。可独立完成微信原生小程序、uni-app 项目的全流程开发与上线。</p>
      </div>

      <!-- Right content -->
      <div class="about-section__side about-section__side--right" :style="{ opacity: contentOpacity }">
        <dl class="about-meta">
          <div class="about-meta__item">
            <dt>学历</dt>
            <dd>北京信息科技大学 · 本科</dd>
          </div>
          <div class="about-meta__item">
            <dt>经验</dt>
            <dd>10年+ 前端</dd>
          </div>
          <div class="about-meta__item">
            <dt>跨端</dt>
            <dd>微信原生 / uni-app</dd>
          </div>
          <div class="about-meta__item">
            <dt>语言</dt>
            <dd>中文母语 · 英文读写流利</dd>
          </div>
          <div class="about-meta__item">
            <dt>状态</dt>
            <dd class="about-meta__status">🟢 开放机会</dd>
          </div>
        </dl>
      </div>
    </div>
  </section>
</template>

<style scoped>
.about-section {
  position: relative;
  padding: 80px 0 100px;
  overflow: hidden;
  background: var(--color-bg);
  border-top: 1px solid var(--color-border);
}

.about-section__inner {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 260px 1fr;
  grid-template-rows: auto;
  align-items: center;
  gap: 0;
  min-height: 460px;
}

/* ── Center circle ── */
.about-section__center {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.about-section__ring {
  width: 240px;
  height: 240px;
  will-change: transform, opacity;
  transition: transform 0.1s linear, opacity 0.2s linear;
}

/* Orbiting dots */
.about-section__dot {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 6px;
  height: 6px;
  background: var(--color-accent);
  border-radius: 50%;
  will-change: transform, opacity;
  transition: opacity 0.3s var(--ease);
}

/* ── Side panels ── */
.about-section__side {
  transition: opacity 0.5s var(--ease) 0.15s;
}

.about-section__side--left {
  text-align: right;
  padding-right: var(--space-6);
}

.about-section__side--left :deep(.section__head) {
  justify-content: flex-end;
}

.about-section__side--right {
  padding-left: var(--space-6);
}

.about-section__side p {
  font-size: var(--fs-sm);
  line-height: 1.8;
  color: var(--color-text-soft);
  margin-bottom: var(--space-3);
}

/* ── Meta list ── */
.about-meta {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin: 0;
}

.about-meta__item {
  padding: var(--space-3) var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  transition: border-color 0.2s var(--ease);
}

.about-meta__item:hover {
  border-color: var(--color-accent);
}

.about-meta__item dt {
  font-size: var(--fs-xs);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 2px;
}

.about-meta__item dd {
  margin: 0;
  font-size: var(--fs-sm);
  color: var(--color-text);
  font-weight: 600;
}

.about-meta__status {
  color: var(--color-accent2) !important;
}

/* ── Responsive ── */
@media (max-width: 1024px) {
  .about-section__inner {
    grid-template-columns: 1fr 200px 1fr;
    min-height: 400px;
  }
  .about-section__ring {
    width: 180px;
    height: 180px;
  }
}

@media (max-width: 768px) {
  .about-section {
    padding: 60px 0 80px;
  }
  .about-section__inner {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
    gap: var(--space-6);
    min-height: auto;
  }
  .about-section__center {
    order: -1;
  }
  .about-section__side--left {
    text-align: left;
    padding-right: 0;
  }
  .about-section__side--left :deep(.section__head) {
    justify-content: flex-start;
  }
  .about-section__side--right {
    padding-left: 0;
  }
  .about-section__ring {
    width: 140px;
    height: 140px;
  }
  .about-meta {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}
</style>
