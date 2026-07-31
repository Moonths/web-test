<script setup lang="ts">
import { ref, computed } from 'vue'
import { projects } from '@/data/resume'
import { useScrollReveal } from '@/composables/useScrollReveal'

const sectionRef = ref<HTMLElement | null>(null)
const { progress } = useScrollReveal(sectionRef, { factor: 3.2 })

function projectNum(index: number): string {
  return String(index + 1).padStart(2, '0')
}

function cardProgress(index: number, total: number): number {
  const segmentSize = 1 / total
  const start = index * segmentSize
  const raw = (progress.value - start) / segmentSize
  return Math.max(0, Math.min(1, raw))
}

const cardProgressList = computed(() =>
  projects.map((_, i) => cardProgress(i, projects.length))
)

// Vertically staggered sticky tops + slight horizontal offset for stacked look
function cardTop(index: number): number { return 80 + index * 14 }
</script>

<template>
  <section id="projects" ref="sectionRef" class="projects-section">
    <div class="projects-section__header container">
      <header class="section__head">
        <span class="section__num">04</span>
        <h2 class="section__title">精选项目</h2>
      </header>
      <p class="projects-section__lead">主导过的中大型项目，涵盖 ERP 管理后台、小程序电商、仓储物流等业务领域。</p>
    </div>

    <div class="projects-stack">
      <article
        v-for="(project, index) in projects"
        :key="project.title"
        class="project-slide"
        :style="{
          zIndex: index + 1,
          top: cardTop(index) + 'px',
        }"
      >
        <span class="project-slide__num">{{ projectNum(index) }}</span>

        <div
          class="project-slide__content"
          :style="{
            opacity: Math.min(1, cardProgressList[index] * 3),
            transform: `translateY(${(1 - cardProgressList[index]) * 24}px)`,
          }"
        >
          <!-- 小标签 -->
          <div class="project-slide__label">PROJECT {{ projectNum(index) }}</div>
          <h3 class="project-slide__title">{{ project.title }}</h3>
          <p class="project-slide__desc">{{ project.desc }}</p>
          <ul class="project-slide__tags">
            <li
              v-for="(tag, ti) in project.tags"
              :key="tag"
              :style="{ transitionDelay: `${0.08 + ti * 0.05}s` }"
            >{{ tag }}</li>
          </ul>
        </div>
      </article>
    </div>

    <div class="projects-section__spacer" />
  </section>
</template>

<style scoped>
.projects-section {
  position: relative;
  background: var(--color-bg-alt);
  padding-bottom: 0;
}

.projects-section__header {
  padding-top: var(--space-9);
  padding-bottom: var(--space-6);
  position: relative;
  z-index: 10;
}

.projects-section__lead {
  color: var(--color-text-soft);
  font-size: var(--fs-md);
  max-width: 560px;
  margin: 0;
}

.projects-stack {
  position: relative;
  padding: 0 var(--space-6);
}

/* ── Card ── */
.project-slide {
  position: sticky;
  max-width: 880px;
  margin: 0 auto;
  padding: 56px 64px;
  min-height: 420px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-bg) 0%, var(--color-surface) 100%);
  border: 1px solid var(--color-border);
  border-radius: 24px;
  overflow: hidden;
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.25),
    0 1px 0 var(--color-border);
  transition: box-shadow 0.3s var(--ease), border-color 0.3s var(--ease);
}

.project-slide:hover {
  border-color: var(--color-accent);
  box-shadow:
    0 8px 40px rgba(0, 0, 0, 0.35),
    0 1px 0 var(--color-accent);
}

/* ── Background number ── */
.project-slide__num {
  position: absolute;
  right: 48px;
  top: 32px;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 10rem;
  line-height: 1;
  color: var(--color-accent);
  opacity: 0.05;
  pointer-events: none;
  user-select: none;
  transition: opacity 0.4s var(--ease), transform 0.4s var(--ease);
}

.project-slide:hover .project-slide__num {
  opacity: 0.1;
  transform: scale(1.04);
}

/* ── Content ── */
.project-slide__content {
  position: relative;
  z-index: 1;
  will-change: transform, opacity;
  max-width: 580px;
}

.project-slide__label {
  font-family: var(--font-mono);
  font-size: var(--fs-xs);
  font-weight: 600;
  letter-spacing: 0.12em;
  color: var(--color-accent);
  margin-bottom: var(--space-3);
}

.project-slide__title {
  font-family: var(--font-display);
  font-size: var(--fs-xl);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-text);
  margin-bottom: var(--space-4);
}

.project-slide__desc {
  font-size: var(--fs-md);
  line-height: 1.75;
  color: var(--color-text-soft);
  margin-bottom: var(--space-5);
}

.project-slide__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.project-slide__tags li {
  font-family: var(--font-mono);
  font-size: var(--fs-xs);
  color: var(--color-accent);
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.18);
  padding: 5px 14px;
  border-radius: var(--radius-pill);
  font-weight: 500;
  letter-spacing: 0.02em;
  transition: all 0.25s var(--ease);
}

.project-slide__tags li:hover {
  background: rgba(99, 102, 241, 0.18);
  border-color: var(--color-accent);
}

.projects-section__spacer {
  height: 240px;
  pointer-events: none;
}

/* ── Responsive ── */
@media (max-width: 1024px) {
  .project-slide {
    max-width: 100%;
    margin: 0;
    padding: 48px 40px;
    min-height: 360px;
    transform: none;
  }
  .project-slide__num { font-size: 7rem; right: 32px; }
}

@media (max-width: 768px) {
  .project-slide {
    padding: 40px var(--space-6);
    min-height: auto;
    border-radius: 20px;
    transform: none;
  }
  .project-slide__num { font-size: 4rem; right: 24px; top: 24px; }
  .project-slide__content { max-width: 100%; }
  .project-slide__title { font-size: var(--fs-lg); }
  .projects-stack { padding: 0 var(--space-4); }
  .projects-section__spacer { height: 160px; }
}
</style>
