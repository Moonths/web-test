<template>
  <section id="skills" class="rw-skills" ref="sectionRef">
    <div class="rw-skills__content">
      <div class="rw-skills__header" ref="headerTarget" :class="{ 'is-in': headerInView }">
        <span class="rw-skills__label rw-fade">02 · 技能栈</span>
        <h2 class="rw-skills__title">
          <span class="rw-line"><span class="rw-line__inner">技术</span></span>
          <span class="rw-line"><span class="rw-line__inner rw-skills__title-accent">能力图谱</span></span>
        </h2>
      </div>

      <div class="rw-skills__grid">
        <div
          v-for="(skill, index) in skills"
          :key="skill.title"
          class="skill-group"
          :ref="(el) => setSkillRef(el, index)"
          :style="{ '--delay': `${index * 0.1}s` }"
        >
          <h3 class="skill-group__title">{{ skill.title }}</h3>
          <div class="skill-group__items">
            <span
              v-for="item in skill.items"
              :key="item"
              class="skill-chip"
            >{{ item }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { skills } from '@/data/resume'
import { useInView } from '@/composables/useScrollMotion'

const sectionRef = ref<HTMLElement | null>(null)
const skillRefs = ref<HTMLElement[]>([])
let observer: IntersectionObserver | null = null

const { target: headerTarget, inView: headerInView } = useInView(0.3)

function setSkillRef(el: unknown, index: number) {
  if (el) skillRefs.value[index] = el as HTMLElement
}

onMounted(() => {
  const section = sectionRef.value
  if (!section) return

  // Initial hide
  skillRefs.value.forEach((el) => {
    if (el) el.style.opacity = '0'
  })

  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        skillRefs.value.forEach((el, i) => {
          if (el) {
            setTimeout(() => {
              el.style.transition = 'opacity 0.6s ease, transform 0.6s ease'
              el.style.opacity = '1'
              el.style.transform = 'translateY(0)'
            }, i * 100)
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
.rw-skills {
  padding: 140px 0;
  background: #08080E;
  position: relative;
  overflow: hidden;
}

.rw-skills::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(79,70,229,0.03), transparent 70%);
  pointer-events: none;
}

.rw-skills__content {
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 48px;
}

.rw-skills__header {
  margin-bottom: 64px;
}

.rw-skills__label {
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

.rw-skills__label::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 20px;
  height: 1.5px;
  background: #818CF8;
  transform: translateY(-50%);
}

.rw-skills__title {
  font-family: 'Syne', 'PingFang SC', sans-serif;
  font-size: 48px;
  font-weight: 700;
  line-height: 1.1;
  color: #F1F5F9;
  letter-spacing: -0.03em;
}

.rw-skills__title-accent {
  background: linear-gradient(135deg, #818CF8, #6366F1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.rw-skills__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.skill-group {
  padding: 32px;
  background: rgba(15, 15, 25, 0.5);
  border: 1px solid rgba(129, 140, 248, 0.06);
  border-radius: 16px;
  transition: border-color 0.3s ease, background 0.3s ease;
  opacity: 0;
  transform: translateY(20px);
}

.skill-group:hover {
  border-color: rgba(129, 140, 248, 0.15);
  background: rgba(15, 15, 25, 0.8);
}

.skill-group__title {
  font-family: 'Syne', 'PingFang SC', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #818CF8;
  margin: 0 0 16px;
  letter-spacing: 0.04em;
}

.skill-group__items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skill-chip {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: #94A3B8;
  background: rgba(129, 140, 248, 0.04);
  border: 1px solid rgba(129, 140, 248, 0.06);
  padding: 6px 14px;
  border-radius: 6px;
  letter-spacing: 0.01em;
  transition: all 0.2s ease;
}

.skill-chip:hover {
  color: #818CF8;
  border-color: rgba(129, 140, 248, 0.25);
  background: rgba(129, 140, 248, 0.08);
}

@media (max-width: 1024px) {
  .rw-skills { padding: 120px 0; }
  .rw-skills__title { font-size: 38px; }
  .skill-group { padding: 28px; }
}

@media (max-width: 768px) {
  .rw-skills { padding: 100px 0; }
  .rw-skills__content { padding: 0 24px; }
  .rw-skills__title { font-size: 32px; }
  .rw-skills__grid { grid-template-columns: 1fr; gap: 16px; }
}

@media (max-width: 480px) {
  .rw-skills { padding: 80px 0; }
  .rw-skills__title { font-size: 26px; }
  .skill-group { padding: 24px; }
}
</style>
