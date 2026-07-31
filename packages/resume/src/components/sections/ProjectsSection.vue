<template>
  <section id="projects" class="rw-projects" ref="sectionRef">
    <div
      class="rw-projects__header"
      ref="headerTarget"
      :class="{ 'is-in': headerInView }"
    >
      <div class="rw-projects__header-inner">
        <span class="rw-projects__label rw-fade">04 · 精选项目</span>
        <h2 class="rw-projects__title" aria-label="交付过的关键项目">
          <span class="rw-line"><span class="rw-line__inner">交付过的</span></span>
          <span class="rw-line"><span class="rw-line__inner rw-projects__title-accent">关键项目</span></span>
        </h2>
        <p class="rw-projects__subtitle rw-fade">
          从集团级 ERP 到微信小程序，从前端架构到 BFF 服务层，
          每个项目都代表一次完整的技术交付。
        </p>
      </div>
    </div>

    <!-- Sticky stacking deck -->
    <div class="rw-projects__stack" ref="stackRef">
      <div
        v-for="(project, index) in projects"
        :key="project.title"
        class="stack-item"
        :style="{ '--i': index, zIndex: index + 1 }"
        :ref="(el) => setItemRef(el, index)"
      >
        <article class="stack-card" :ref="(el) => setCardRef(el, index)">
          <div class="stack-card__inner">
            <div class="stack-card__number">
              <span class="card-num">{{ String(index + 1).padStart(2, '0') }}</span>
            </div>
            <div class="stack-card__body">
              <h3 class="stack-card__title">{{ project.title }}</h3>
              <p class="stack-card__desc">{{ project.desc }}</p>
              <ul class="stack-card__tags">
                <li v-for="tag in project.tags" :key="tag">{{ tag }}</li>
              </ul>
            </div>
            <div class="stack-card__icon" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { projects } from '@/data/resume'
import {
  clamp01,
  prefersReducedMotion,
  useInView,
  useRafScrollLoop,
} from '@/composables/useScrollMotion'

const sectionRef = ref<HTMLElement | null>(null)
const stackRef = ref<HTMLElement | null>(null)
const itemEls: (HTMLElement | null)[] = []
const cardEls: (HTMLElement | null)[] = []

const { target: headerTarget, inView: headerInView } = useInView(0.3)

const reducedMotion = prefersReducedMotion()

function setItemRef(el: unknown, index: number) {
  itemEls[index] = el as HTMLElement | null
}

function setCardRef(el: unknown, index: number) {
  cardEls[index] = el as HTMLElement | null
}

/**
 * Deck physics: as the next card slides up and approaches its sticky
 * resting position, the card beneath it scales down and dims.
 */
function update() {
  if (reducedMotion) return
  const stack = stackRef.value
  if (!stack) return
  const vh = window.innerHeight
  const base = parseFloat(getComputedStyle(stack).getPropertyValue('--stack-base')) || 96
  const step = 14

  for (let i = 0; i < itemEls.length - 1; i++) {
    const next = itemEls[i + 1]
    const card = cardEls[i]
    if (!next || !card) continue
    const stickTopNext = base + (i + 1) * step
    const p = clamp01((vh - next.getBoundingClientRect().top) / (vh - stickTopNext))
    card.style.transform = `scale(${1 - p * 0.05})`
    card.style.filter = `brightness(${1 - p * 0.45})`
  }
}

useRafScrollLoop(sectionRef, update)
</script>

<style scoped>
.rw-projects {
  position: relative;
  padding: 140px 0 120px;
  background: #06060C;
}

.rw-projects__header {
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 48px 80px;
}

.rw-projects__header-inner {
  max-width: 560px;
}

.rw-projects__label {
  display: inline-block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: #818CF8;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 20px;
  position: relative;
  padding-left: 32px;
}

.rw-projects__label::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 20px;
  height: 1.5px;
  background: #818CF8;
  transform: translateY(-50%);
}

.rw-projects__title {
  font-family: 'Syne', 'PingFang SC', sans-serif;
  font-size: 48px;
  font-weight: 700;
  line-height: 1.1;
  color: #F1F5F9;
  letter-spacing: -0.03em;
  margin-bottom: 24px;
}

.rw-projects__title-accent {
  background: linear-gradient(135deg, #818CF8, #6366F1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.rw-projects__subtitle {
  font-size: 15px;
  line-height: 1.7;
  color: #64748B;
}

/* ── Sticky stack ── */
.rw-projects__stack {
  --stack-base: 96px;
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  padding: 0 48px 14vh;
  position: relative;
}

.stack-item {
  position: sticky;
  top: calc(var(--stack-base) + var(--i) * 14px);
  margin-bottom: 28px;
}

.stack-card {
  transform-origin: 50% 0;
  will-change: transform, filter;
}

.stack-card__inner {
  display: grid;
  grid-template-columns: 48px 1fr 32px;
  gap: 28px;
  align-items: start;
  padding: 36px 40px;
  background: linear-gradient(160deg, #101018 0%, #0C0C14 100%);
  border: 1px solid rgba(129, 140, 248, 0.1);
  border-radius: 16px;
  box-shadow: 0 -18px 50px rgba(0, 0, 0, 0.45);
  transition: border-color 0.35s ease;
}

.stack-card__inner:hover {
  border-color: rgba(129, 140, 248, 0.24);
}

.stack-card__number .card-num {
  font-family: 'Syne', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: rgba(129, 140, 248, 0.35);
  letter-spacing: 0.04em;
}

.stack-card__title {
  font-family: 'Syne', 'PingFang SC', sans-serif;
  font-size: 20px;
  font-weight: 600;
  color: #F1F5F9;
  margin: 0 0 12px;
  line-height: 1.3;
  letter-spacing: -0.02em;
}

.stack-card__desc {
  font-size: 14px;
  line-height: 1.7;
  color: #94A3B8;
  margin: 0 0 16px;
}

.stack-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.stack-card__tags li {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #818CF8;
  background: rgba(129, 140, 248, 0.08);
  padding: 4px 12px;
  border-radius: 20px;
  letter-spacing: 0.02em;
  font-weight: 500;
}

.stack-card__icon {
  color: rgba(129, 140, 248, 0.25);
  margin-top: 4px;
  transition: color 0.3s ease, transform 0.3s ease;
}

.stack-card__inner:hover .stack-card__icon {
  color: #818CF8;
  transform: translateX(4px);
}

/* ── Responsive ── */
@media (max-width: 1024px) {
  .rw-projects { padding: 120px 0 100px; }
  .rw-projects__title { font-size: 38px; }
  .stack-card__inner { padding: 28px 32px; gap: 20px; }
}

@media (max-width: 768px) {
  .rw-projects { padding: 100px 0 80px; }
  .rw-projects__header { padding: 0 24px 56px; }
  .rw-projects__title { font-size: 32px; }
  .rw-projects__stack { --stack-base: 72px; padding: 0 20px 10vh; }
  .stack-item { margin-bottom: 20px; }
  .stack-card__inner {
    grid-template-columns: 1fr;
    gap: 8px;
    padding: 24px;
  }
  .stack-card__number { display: none; }
  .stack-card__icon { display: none; }
}

@media (max-width: 480px) {
  .rw-projects__title { font-size: 26px; }
  .stack-card__title { font-size: 18px; }
}
</style>
