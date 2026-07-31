<script setup lang="ts">
import { ref } from 'vue'
import { experience } from '@/data/resume'
import { useInView } from '@/composables/useScrollReveal'

const sectionRef = ref<HTMLElement | null>(null)
const { inView } = useInView(sectionRef, { threshold: 0.1 })
</script>

<template>
  <section id="experience" ref="sectionRef" class="exp-section">
    <div class="container exp-section__inner">
      <header class="section__head">
        <span class="section__num">03</span>
        <h2 class="section__title">工作经历</h2>
      </header>
      <ol class="timeline">
        <li
          v-for="(item, index) in experience"
          :key="item.period"
          class="timeline__item"
          :class="{ 'timeline__item--visible': inView }"
          :style="{ transitionDelay: `${0.15 + index * 0.15}s` }"
        >
          <div class="timeline__meta">
            <time>{{ item.period }}</time>
            <span class="timeline__company">{{ item.company }}</span>
          </div>
          <div class="timeline__body">
            <h3>{{ item.role }}</h3>
            <ul>
              <li v-for="(bullet, bi) in item.bullets" :key="bi" :style="{ transitionDelay: `${0.3 + index * 0.15 + bi * 0.08}s` }">{{ bullet }}</li>
            </ul>
          </div>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.exp-section {
  padding: var(--space-9) 0;
  background: var(--color-bg-alt);
  border-top: 1px solid var(--color-border);
  overflow: hidden;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}

.timeline__item {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: var(--space-8);
  padding: var(--space-7) 0 var(--space-7) var(--space-7);
  border-left: 2px solid var(--color-border);
  position: relative;
  opacity: 0;
  transform: translateX(-16px);
  transition: opacity 0.6s var(--ease), transform 0.6s var(--ease), border-color 0.3s var(--ease);
}

.timeline__item--visible { opacity: 1; transform: translateX(0); }
.timeline__item:hover { border-left-color: var(--color-accent); }

.timeline__item::before {
  content: "";
  position: absolute;
  left: -5px;
  top: calc(var(--space-7) + 8px);
  width: 8px;
  height: 8px;
  background: var(--color-accent);
  border-radius: 50%;
  box-shadow: 0 0 0 3px var(--color-bg-alt);
  transition: transform 0.3s var(--ease), box-shadow 0.3s var(--ease);
}

.timeline__item:hover::before { transform: scale(1.5); box-shadow: 0 0 0 5px rgba(99, 102, 241, 0.2); }

.timeline__meta time {
  display: block;
  font-family: var(--font-mono);
  color: var(--color-accent);
  font-size: var(--fs-xs);
  letter-spacing: 0.06em;
  margin-bottom: var(--space-1);
}

.timeline__company { color: var(--color-text-muted); font-size: var(--fs-sm); font-weight: 500; }

.timeline__body h3 { font-size: var(--fs-lg); font-weight: 700; color: var(--color-text); margin-bottom: var(--space-3); }

.timeline__body ul { display: flex; flex-direction: column; gap: var(--space-2); margin: 0; padding: 0; list-style: none; }

.timeline__body ul li {
  position: relative;
  padding-left: var(--space-5);
  font-size: var(--fs-sm);
  color: var(--color-text-soft);
  line-height: 1.7;
  opacity: 0;
  transform: translateX(-8px);
  transition: opacity 0.5s var(--ease), transform 0.5s var(--ease);
}

.timeline__item--visible .timeline__body ul li { opacity: 1; transform: translateX(0); }

.timeline__body ul li::before {
  content: "\2014";
  position: absolute;
  left: 0;
  color: var(--color-accent);
  font-weight: 700;
}

@media (max-width: 1024px) {
  .timeline__item { grid-template-columns: 160px 1fr; gap: var(--space-6); }
}

@media (max-width: 768px) {
  .timeline__item { grid-template-columns: 1fr; gap: var(--space-2); padding-left: var(--space-6); }
  .timeline__meta { display: flex; align-items: center; gap: var(--space-3); }
}
</style>
