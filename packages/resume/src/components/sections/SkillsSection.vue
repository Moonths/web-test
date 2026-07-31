<script setup lang="ts">
import { ref } from 'vue'
import { skills } from '@/data/resume'
import { useInView } from '@/composables/useScrollReveal'

const sectionRef = ref<HTMLElement | null>(null)
const { inView } = useInView(sectionRef, { threshold: 0.12 })

// Icons mapped to each category
const categoryIcons: Record<string, string> = {
  '前端框架与技术': '{}',
  '移动端 & 小程序': '\u{1F4F1}',
  '后端 & BFF': '\u{26A1}',
  '工程化 & 工具': '\u{1F6E0}',
}
</script>

<template>
  <section id="skills" ref="sectionRef" class="skills-section">
    <div class="container">
      <header class="section__head">
        <span class="section__num">02</span>
        <h2 class="section__title">技能栈</h2>
      </header>

      <div class="skills-grid">
        <div
          v-for="(skill, index) in skills"
          :key="skill.title"
          class="skill-card"
          :class="{ 'skill-card--visible': inView }"
          :style="{ transitionDelay: `${0.1 + index * 0.1}s` }"
        >
          <!-- Icon area -->
          <div class="skill-card__icon">
            <span class="skill-card__emoji">{{ categoryIcons[skill.title] || '◆' }}</span>
          </div>

          <!-- Content -->
          <div class="skill-card__body">
            <h3 class="skill-card__title">{{ skill.title }}</h3>
            <ul class="skill-card__list">
              <li
                v-for="(item, ii) in skill.items"
                :key="item"
                :style="{ transitionDelay: `${0.2 + index * 0.1 + ii * 0.05}s` }"
              >{{ item }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.skills-section {
  padding: var(--space-9) 0;
  background: var(--color-bg);
  border-top: 1px solid var(--color-border);
  overflow: hidden;
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-5);
}

/* ── Card ── */
.skill-card {
  display: flex;
  gap: var(--space-6);
  padding: var(--space-7);
  background: linear-gradient(135deg, var(--color-surface) 0%, rgba(26, 35, 50, 0.4) 100%);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  opacity: 0;
  transform: translateY(24px);
  transition:
    opacity 0.5s var(--ease),
    transform 0.5s var(--ease),
    border-color 0.3s var(--ease),
    box-shadow 0.3s var(--ease);
  position: relative;
  overflow: hidden;
}

/* Subtle top accent line */
.skill-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: var(--space-7);
  right: var(--space-7);
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--color-accent), transparent);
  opacity: 0;
  transition: opacity 0.3s var(--ease);
}

.skill-card--visible {
  opacity: 1;
  transform: translateY(0);
}

.skill-card:hover {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 1px rgba(165, 180, 252, 0.15), 0 8px 32px rgba(0, 0, 0, 0.2);
}

.skill-card:hover::before {
  opacity: 1;
}

/* ── Icon ── */
.skill-card__icon {
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition: border-color 0.3s var(--ease), background 0.3s var(--ease);
}

.skill-card:hover .skill-card__icon {
  border-color: var(--color-accent);
  background: rgba(165, 180, 252, 0.06);
}

.skill-card__emoji {
  font-size: 24px;
  line-height: 1;
}

/* ── Body ── */
.skill-card__body {
  flex: 1;
  min-width: 0;
}

.skill-card__title {
  font-size: var(--fs-sm);
  font-weight: 700;
  font-family: var(--font-display);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text);
  margin: 0 0 var(--space-4);
}

.skill-card__list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.skill-card__list li {
  font-size: var(--fs-sm);
  color: var(--color-text-soft);
  padding: 4px 0;
  opacity: 0;
  transform: translateY(6px);
  transition:
    opacity 0.4s var(--ease),
    transform 0.4s var(--ease),
    color 0.2s var(--ease);
}

/* Add separator between items */
.skill-card__list li + li::before {
  content: '·';
  margin: 0 var(--space-2);
  color: var(--color-text-muted);
}

.skill-card--visible .skill-card__list li {
  opacity: 1;
  transform: translateY(0);
}

.skill-card__list li:hover {
  color: var(--color-accent);
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .skills-grid {
    grid-template-columns: 1fr;
  }
  .skill-card {
    padding: var(--space-5);
    gap: var(--space-4);
  }
  .skill-card__icon {
    width: 44px;
    height: 44px;
  }
  .skill-card__emoji {
    font-size: 20px;
  }
}
</style>
