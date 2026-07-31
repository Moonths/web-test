<script setup lang="ts">
import { ref } from 'vue'
import { useInView } from '@/composables/useScrollReveal'

const sectionRef = ref<HTMLElement | null>(null)
const { inView } = useInView(sectionRef, { threshold: 0.2 })
</script>

<template>
  <section id="contact" ref="sectionRef" class="contact-section">
    <div class="container contact" :class="{ 'contact--visible': inView }">
      <header class="section__head">
        <span class="section__num">05</span>
        <h2 class="section__title">联系我</h2>
      </header>
      <p class="contact__lead">如果你有合作机会或想进一步了解我的经历，欢迎随时联系</p>
      <ul class="contact__list">
        <li><a href="mailto:moonths@yeah.net">moonths@yeah.net</a></li>
        <li><span class="contact__location">北京</span></li>
      </ul>
      <a class="btn btn--primary" href="mailto:moonths@yeah.net">发送邮件</a>
    </div>
  </section>
</template>

<style scoped>
.contact-section {
  padding: var(--space-9) 0;
  background: var(--color-bg);
  border-top: 1px solid var(--color-border);
}

.contact {
  max-width: 640px;
  margin: 0 auto;
  text-align: center;
  opacity: 0;
  transform: translateY(32px);
  transition: opacity 0.8s var(--ease), transform 0.8s var(--ease);
}

.contact--visible { opacity: 1; transform: translateY(0); }

.contact__lead { color: var(--color-text-soft); font-size: var(--fs-md); margin-bottom: var(--space-6); }

.contact__list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-5);
  justify-content: center;
  margin: 0 0 var(--space-7);
  padding: 0;
  list-style: none;
}

.contact__list a {
  font-size: var(--fs-sm);
  color: var(--color-text-soft);
  font-weight: 500;
  transition: color 0.2s var(--ease);
}

.contact__list a:hover { color: var(--color-accent); }

.contact__location {
  font-size: var(--fs-sm);
  color: var(--color-text-soft);
  font-weight: 500;
}

@media (max-width: 768px) {
  .contact__list { flex-direction: column; gap: var(--space-3); }
}
</style>
