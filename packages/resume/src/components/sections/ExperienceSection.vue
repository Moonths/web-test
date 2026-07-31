<template>
  <section id="experience" class="rw-experience" ref="sectionRef">
    <div class="rw-experience__content">
      <div class="rw-experience__header" ref="headerTarget" :class="{ 'is-in': headerInView }">
        <span class="rw-experience__label rw-fade">03 · 工作经历</span>
        <h2 class="rw-experience__title">
          <span class="rw-line"><span class="rw-line__inner">职业</span></span>
          <span class="rw-line"><span class="rw-line__inner rw-experience__title-accent">发展轨迹</span></span>
        </h2>
      </div>

      <div class="rw-experience__timeline">
        <div
          v-for="(item, index) in experience"
          :key="item.period"
          class="tl-item"
          :ref="(el) => setTlRef(el, index)"
        >
          <div class="tl-item__line">
            <div class="tl-dot"></div>
            <div class="tl-connector" v-if="index < experience.length - 1"></div>
          </div>
          <div class="tl-item__content">
            <div class="tl-item__meta">
              <time class="tl-item__period">{{ item.period }}</time>
              <span class="tl-item__company">{{ item.company }}</span>
            </div>
            <h3 class="tl-item__role">{{ item.role }}</h3>
            <ul class="tl-item__bullets">
              <li v-for="(bullet, i) in item.bullets" :key="i">{{ bullet }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { experience } from '@/data/resume'
import { useInView } from '@/composables/useScrollMotion'

const sectionRef = ref<HTMLElement | null>(null)
const tlRefs = ref<HTMLElement[]>([])
let observer: IntersectionObserver | null = null

const { target: headerTarget, inView: headerInView } = useInView(0.3)

function setTlRef(el: unknown, index: number) {
  if (el) tlRefs.value[index] = el as HTMLElement
}

onMounted(() => {
  const section = sectionRef.value
  if (!section) return

  tlRefs.value.forEach((el) => {
    if (el) {
      el.style.opacity = '0'
      el.style.transform = 'translateX(-20px)'
    }
  })

  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        tlRefs.value.forEach((el, i) => {
          if (el) {
            setTimeout(() => {
              el.style.transition = 'opacity 0.5s ease, transform 0.5s ease'
              el.style.opacity = '1'
              el.style.transform = 'translateX(0)'
            }, i * 200)
          }
        })
        observer?.disconnect()
      }
    },
    { threshold: 0.15 }
  )

  observer.observe(section)
})
</script>

<style scoped>
.rw-experience {
  padding: 140px 0;
  background: #06060C;
  position: relative;
}

.rw-experience__content {
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 48px;
}

.rw-experience__header {
  margin-bottom: 72px;
}

.rw-experience__label {
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

.rw-experience__label::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 20px;
  height: 1.5px;
  background: #818CF8;
  transform: translateY(-50%);
}

.rw-experience__title {
  font-family: 'Syne', 'PingFang SC', sans-serif;
  font-size: 48px;
  font-weight: 700;
  line-height: 1.1;
  color: #F1F5F9;
  letter-spacing: -0.03em;
}

.rw-experience__title-accent {
  background: linear-gradient(135deg, #818CF8, #6366F1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ── Timeline ── */
.rw-experience__timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.tl-item {
  display: grid;
  grid-template-columns: 24px 1fr;
  gap: 32px;
  opacity: 0;
  transform: translateX(-20px);
}

.tl-item__line {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tl-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #818CF8;
  border: 2px solid rgba(129, 140, 248, 0.2);
  flex-shrink: 0;
  margin-top: 6px;
}

.tl-connector {
  width: 1.5px;
  flex: 1;
  background: linear-gradient(to bottom, rgba(129, 140, 248, 0.2), rgba(129, 140, 248, 0.05));
  min-height: 40px;
  margin: 8px 0;
}

.tl-item__content {
  padding-bottom: 48px;
}

.tl-item__meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
}

.tl-item__period {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: #818CF8;
  letter-spacing: 0.04em;
  background: rgba(129, 140, 248, 0.08);
  padding: 3px 10px;
  border-radius: 4px;
}

.tl-item__company {
  font-size: 13px;
  color: #64748B;
  font-weight: 500;
}

.tl-item__role {
  font-family: 'Syne', 'PingFang SC', sans-serif;
  font-size: 22px;
  font-weight: 600;
  color: #F1F5F9;
  margin: 0 0 16px;
  letter-spacing: -0.02em;
}

.tl-item__bullets {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.tl-item__bullets li {
  position: relative;
  padding-left: 20px;
  font-size: 14px;
  line-height: 1.7;
  color: #94A3B8;
}

.tl-item__bullets li::before {
  content: '—';
  position: absolute;
  left: 0;
  color: #818CF8;
  font-weight: 700;
}

@media (max-width: 1024px) {
  .rw-experience { padding: 120px 0; }
  .rw-experience__title { font-size: 38px; }
}

@media (max-width: 768px) {
  .rw-experience { padding: 100px 0; }
  .rw-experience__content { padding: 0 24px; }
  .rw-experience__title { font-size: 32px; }
  .tl-item { gap: 20px; }
  .tl-item__role { font-size: 18px; }
}

@media (max-width: 480px) {
  .rw-experience { padding: 80px 0; }
  .rw-experience__title { font-size: 26px; }
  .tl-item__meta { flex-direction: column; align-items: flex-start; gap: 6px; }
}
</style>
