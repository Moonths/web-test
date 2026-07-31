<template>
  <section id="about" class="rw-about" ref="sectionRef">
    <!-- Pinned circular zoom stage -->
    <div class="rw-about__track" ref="trackRef">
      <div class="rw-about__stage" ref="stageTarget">
        <div
          class="rw-about__stage-inner"
          ref="stageInnerRef"
          :class="{ 'is-in': stageInView }"
        >
          <div class="rw-about__vignette" aria-hidden="true"></div>

          <!-- Concentric rings, expanding with scroll -->
          <div class="rw-about__circles" ref="circlesRef" aria-hidden="true">
            <div class="ring ring--xl" ref="ringXlRef"></div>
            <div class="ring ring--l" ref="ringLRef"></div>
            <div class="ring ring--m" ref="ringMRef"></div>
            <div class="ring ring--s" ref="ringSRef"></div>
            <div class="ring ring--dash" ref="ringDashRef"></div>
          </div>

          <!-- Center heading -->
          <div class="rw-about__heading" ref="headingRef">
            <span class="rw-about__label rw-fade">01 · 关于我</span>
            <h2 class="rw-about__title" aria-label="架构思维驱动的前端工程师">
              <span class="rw-line"><span class="rw-line__inner">架构思维驱动的</span></span>
              <span class="rw-line"><span class="rw-line__inner rw-about__title-accent">前端工程师</span></span>
            </h2>
          </div>

          <!-- Capability pills, emerging one by one -->
          <div class="rw-about__pills">
            <div
              v-for="(pill, index) in pillState"
              :key="pill.label"
              class="rw-about__pill"
              :ref="(el) => setPillRef(el, index)"
              :style="{ left: `${pill.x * 100}%`, top: `${pill.y * 100}%` }"
            >
              <span class="rw-about__pill-dot" aria-hidden="true"></span>
              <span class="rw-about__pill-text">{{ pill.label }}</span>
            </div>
          </div>

          <!-- Scroll hint -->
          <div class="rw-about__hint" ref="hintRef" aria-hidden="true">
            <span class="rw-about__hint-text">SCROLL</span>
            <span class="rw-about__hint-line"></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail content, revealed after the pinned sequence -->
    <div
      class="rw-about__content"
      ref="contentTarget"
      :class="{ 'is-in': contentInView }"
    >
      <div class="rw-about__grid">
        <div class="rw-about__text">
          <p class="rw-about__lead">
            10年+企业级与 AI 原生应用开发经验，深耕 Vue 生态与 TypeScript 工程化体系建设。
            从移动端 H5 到 PC 端企业级后台，从微信小程序到 NestJS BFF，完整的前后端链路交付能力。
          </p>
          <p>
            主导过集团级 ERP2.0、仓储管理系统、智能文档问答等多个中大型项目。
            擅长将复杂业务需求拆解为可落地的技术方案，从前端到服务层闭环解决业务问题。
          </p>
          <div class="rw-about__stats">
            <div class="stat-item">
              <span class="stat-num">10+</span>
              <span class="stat-label">年经验</span>
            </div>
            <div class="stat-item">
              <span class="stat-num">20+</span>
              <span class="stat-label">项目交付</span>
            </div>
            <div class="stat-item">
              <span class="stat-num">3</span>
              <span class="stat-label">端技术栈</span>
            </div>
          </div>
        </div>

        <div class="rw-about__meta">
          <div class="meta-card">
            <div class="meta-row">
              <span class="meta-key">学历</span>
              <span class="meta-val">北京信息科技大学 · 本科</span>
            </div>
            <div class="meta-row">
              <span class="meta-key">跨端</span>
              <span class="meta-val">微信原生 / uni-app / H5</span>
            </div>
            <div class="meta-row">
              <span class="meta-key">后端</span>
              <span class="meta-val">NestJS / FastAPI</span>
            </div>
            <div class="meta-row">
              <span class="meta-key">状态</span>
              <span class="meta-val status-open">开放机会</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import {
  clamp01,
  easeOutBack,
  easeOutCubic,
  prefersReducedMotion,
  useInView,
  useRafScrollLoop,
} from '@/composables/useScrollMotion'

/* Capability pills — desktop / mobile anchor points around the circle */
const pillDefs = [
  { label: '架构思维', d: [0.5, 0.16], m: [0.5, 0.13] },
  { label: 'Vue 全栈生态', d: [0.78, 0.35], m: [0.79, 0.3] },
  { label: '全链路交付', d: [0.7, 0.74], m: [0.73, 0.67] },
  { label: 'AI 原生应用', d: [0.3, 0.74], m: [0.27, 0.67] },
  { label: '多端覆盖', d: [0.22, 0.35], m: [0.21, 0.3] },
] as const

const pillState = reactive(
  pillDefs.map((p) => ({ label: p.label, x: p.d[0], y: p.d[1] })),
)

const sectionRef = ref<HTMLElement | null>(null)
const trackRef = ref<HTMLElement | null>(null)
const stageInnerRef = ref<HTMLElement | null>(null)
const circlesRef = ref<HTMLElement | null>(null)
const headingRef = ref<HTMLElement | null>(null)
const hintRef = ref<HTMLElement | null>(null)
const ringXlRef = ref<HTMLElement | null>(null)
const ringLRef = ref<HTMLElement | null>(null)
const ringMRef = ref<HTMLElement | null>(null)
const ringSRef = ref<HTMLElement | null>(null)
const ringDashRef = ref<HTMLElement | null>(null)
const pillEls: (HTMLElement | null)[] = []

const { target: stageTarget, inView: stageInView } = useInView(0.05)
const { target: contentTarget, inView: contentInView } = useInView(0.15)

const reducedMotion = prefersReducedMotion()

function setPillRef(el: unknown, index: number) {
  pillEls[index] = el as HTMLElement | null
}

/* Scroll phase windows, expressed in track progress (0..1) */
const RING_PHASES = [
  { el: ringXlRef, start: 0.0 },
  { el: ringLRef, start: 0.05 },
  { el: ringMRef, start: 0.1 },
  { el: ringSRef, start: 0.15 },
]
const RING_SPAN = 0.4
const PILL_START = 0.24
const PILL_STEP = 0.075
const PILL_SPAN = 0.1

function update() {
  if (reducedMotion) return
  const track = trackRef.value
  if (!track) return
  const rect = track.getBoundingClientRect()
  const vh = window.innerHeight
  const total = Math.max(1, rect.height - vh)
  const t = clamp01(-rect.top / total)

  // Continuous zoom into the circle system
  if (circlesRef.value) {
    circlesRef.value.style.transform = `scale(${1 + t * 0.35})`
  }

  // Rings expand in sequence
  for (const { el, start } of RING_PHASES) {
    const node = el.value
    if (!node) continue
    const local = clamp01((t - start) / RING_SPAN)
    const e = easeOutCubic(local)
    node.style.transform = `scale(${0.22 + 0.78 * e})`
    node.style.opacity = String(clamp01(local * 3) * 0.9)
  }
  if (ringDashRef.value) {
    ringDashRef.value.style.opacity = String(clamp01((t - 0.18) / 0.15) * 0.55)
  }

  // Heading gently recedes as the circle takes focus
  if (headingRef.value) {
    headingRef.value.style.transform = `translateY(${t * -34}px) scale(${1 - t * 0.04})`
  }

  // Pills emerge from the circle center one by one
  pillEls.forEach((node, i) => {
    if (!node) return
    const pill = pillState[i]
    const start = PILL_START + i * PILL_STEP
    const local = clamp01((t - start) / PILL_SPAN)
    const scale = 0.45 + 0.55 * easeOutBack(local)
    const dx = (0.5 - pill.x) * 110 * (1 - local)
    const dy = (0.5 - pill.y) * 110 * (1 - local)
    node.style.opacity = String(clamp01(local * 1.6))
    node.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`
  })

  // Scroll hint fades early
  if (hintRef.value) {
    hintRef.value.style.opacity = String(1 - clamp01(t / 0.07))
  }

  // Exit: dissolve the whole composition before the detail content
  if (stageInnerRef.value) {
    const exit = easeOutCubic(clamp01((t - 0.86) / 0.14))
    stageInnerRef.value.style.opacity = String(1 - exit)
    stageInnerRef.value.style.transform = `scale(${1 - exit * 0.06})`
  }
}

function applyStaticLayout() {
  // Reduced motion: everything visible, no scroll-driven transforms
  for (const { el } of RING_PHASES) {
    if (el.value) {
      el.value.style.opacity = '0.9'
      el.value.style.transform = 'none'
    }
  }
  if (ringDashRef.value) ringDashRef.value.style.opacity = '0.55'
  if (hintRef.value) hintRef.value.style.opacity = '0'
  pillEls.forEach((node) => {
    if (node) {
      node.style.opacity = '1'
      node.style.transform = 'none'
    }
  })
}

let mq: MediaQueryList | null = null
function applyPillPositions() {
  const mobile = mq?.matches ?? false
  pillState.forEach((pill, i) => {
    const pos = mobile ? pillDefs[i].m : pillDefs[i].d
    pill.x = pos[0]
    pill.y = pos[1]
  })
}

onMounted(() => {
  mq = window.matchMedia('(max-width: 768px)')
  mq.addEventListener('change', applyPillPositions)
  applyPillPositions()

  if (reducedMotion) {
    applyStaticLayout()
  }
})

onUnmounted(() => {
  mq?.removeEventListener('change', applyPillPositions)
})

useRafScrollLoop(sectionRef, update)
</script>

<style scoped>
.rw-about {
  position: relative;
  background: #08080E;
}

/* ── Pinned stage ── */
.rw-about__track {
  position: relative;
  height: 320vh;
}

.rw-about__stage {
  position: sticky;
  top: 0;
  height: 100dvh;
  overflow: hidden;
}

.rw-about__stage-inner {
  position: absolute;
  inset: 0;
  will-change: transform, opacity;
}

.rw-about__vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 60% 50% at 50% 50%, rgba(79, 70, 229, 0.09), transparent 70%);
  pointer-events: none;
}

/* ── Rings ── */
.rw-about__circles {
  position: absolute;
  inset: 0;
  will-change: transform;
}

.ring {
  position: absolute;
  left: 50%;
  top: 50%;
  translate: -50% -50%;
  border-radius: 50%;
  opacity: 0;
  will-change: transform, opacity;
}

.ring--xl {
  width: 78vmin;
  height: 78vmin;
  border: 1px solid rgba(129, 140, 248, 0.16);
}

.ring--l {
  width: 60vmin;
  height: 60vmin;
  border: 1px solid rgba(129, 140, 248, 0.13);
}

.ring--m {
  width: 42vmin;
  height: 42vmin;
  border: 1px solid rgba(129, 140, 248, 0.11);
}

.ring--s {
  width: 24vmin;
  height: 24vmin;
  border: 1px solid rgba(129, 140, 248, 0.1);
  background: radial-gradient(circle at 42% 40%, rgba(79, 70, 229, 0.1), transparent 70%);
}

.ring--dash {
  width: 90vmin;
  height: 90vmin;
  border: 1px dashed rgba(129, 140, 248, 0.16);
  animation: ring-spin 90s linear infinite;
}

@keyframes ring-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ── Center heading ── */
.rw-about__heading {
  position: absolute;
  left: 50%;
  top: 50%;
  translate: -50% -50%;
  z-index: 2;
  text-align: center;
  will-change: transform;
}

.rw-about__label {
  display: inline-block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: #818CF8;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  margin-bottom: 24px;
}

.rw-about__title {
  font-family: 'Syne', 'PingFang SC', sans-serif;
  font-size: clamp(30px, 4.8vw, 56px);
  font-weight: 700;
  line-height: 1.14;
  color: #F1F5F9;
  letter-spacing: -0.02em;
  white-space: nowrap;
}

.rw-about__title-accent {
  background: linear-gradient(135deg, #818CF8, #6366F1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ── Pills ── */
.rw-about__pill {
  position: absolute;
  translate: -50% -50%;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  background: rgba(15, 15, 25, 0.88);
  border: 1px solid rgba(129, 140, 248, 0.18);
  border-radius: 12px;
  box-shadow: 0 10px 36px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  white-space: nowrap;
  opacity: 0;
  will-change: transform, opacity;
}

.rw-about__pill-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #818CF8;
  box-shadow: 0 0 12px rgba(129, 140, 248, 0.55);
  flex: none;
}

.rw-about__pill-text {
  font-size: 14px;
  font-weight: 500;
  color: #E2E8F0;
  letter-spacing: 0.02em;
}

/* ── Scroll hint ── */
.rw-about__hint {
  position: absolute;
  left: 50%;
  bottom: 36px;
  translate: -50% 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.rw-about__hint-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.28em;
  color: #64748B;
}

.rw-about__hint-line {
  width: 1px;
  height: 44px;
  background: linear-gradient(to bottom, rgba(129, 140, 248, 0.6), transparent);
  animation: hint-drop 1.8s cubic-bezier(0.65, 0, 0.35, 1) infinite;
  transform-origin: top;
}

@keyframes hint-drop {
  0% { transform: scaleY(0); }
  45% { transform: scaleY(1); }
  100% { transform: scaleY(1); opacity: 0; }
}

/* ── Detail content ── */
.rw-about__content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: 6vh 48px 160px;
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1), transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
}

.rw-about__content.is-in {
  opacity: 1;
  transform: none;
}

.rw-about__grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 64px;
  align-items: start;
}

.rw-about__text p {
  font-size: 16px;
  line-height: 1.8;
  color: #94A3B8;
  margin: 0 0 20px;
}

.rw-about__lead {
  font-size: 18px !important;
  color: #E2E8F0 !important;
  font-weight: 500;
}

/* ── Stats ── */
.rw-about__stats {
  display: flex;
  gap: 40px;
  margin-top: 40px;
  padding-top: 32px;
  border-top: 1px solid rgba(129, 140, 248, 0.1);
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-num {
  font-family: 'Syne', sans-serif;
  font-size: 36px;
  font-weight: 800;
  color: #818CF8;
  line-height: 1;
  letter-spacing: -0.03em;
}

.stat-label {
  font-size: 13px;
  color: #64748B;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.04em;
}

/* ── Meta card ── */
.meta-card {
  background: rgba(15, 15, 25, 0.8);
  border: 1px solid rgba(129, 140, 248, 0.08);
  border-radius: 16px;
  padding: 28px;
  backdrop-filter: blur(12px);
}

.meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(129, 140, 248, 0.05);
}

.meta-row:last-child {
  border-bottom: none;
}

.meta-key {
  font-size: 13px;
  color: #64748B;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.04em;
}

.meta-val {
  font-size: 14px;
  color: #E2E8F0;
  font-weight: 500;
  text-align: right;
}

.status-open {
  color: #22C55E;
  position: relative;
}

.status-open::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  background: #22C55E;
  border-radius: 50%;
  margin-right: 6px;
  animation: pulse-dot 2s ease-in-out infinite;
  vertical-align: middle;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

/* ── Responsive ── */
@media (max-width: 1024px) {
  .rw-about__grid { gap: 40px; }
}

@media (max-width: 768px) {
  .rw-about__track { height: 280vh; }
  .rw-about__content { padding: 4vh 24px 120px; }
  .rw-about__grid { grid-template-columns: 1fr; gap: 32px; }
  .rw-about__stats { gap: 24px; }
  .stat-num { font-size: 28px; }
  .rw-about__pill { padding: 9px 14px; gap: 8px; }
  .rw-about__pill-text { font-size: 12.5px; }
  .rw-about__pill-dot { width: 6px; height: 6px; }
  .rw-about__title { letter-spacing: -0.01em; }
}

@media (max-width: 480px) {
  .rw-about__stats { flex-direction: column; gap: 16px; }
}
</style>
